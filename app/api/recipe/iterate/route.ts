// https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 15;

import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import prisma from "../../../../lib/prisma";
import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
  Prisma,
  RecipeIngredient,
  UNIT,
} from "@prisma/client";
import { numericQuantity } from "numeric-quantity";
import { auth } from "../../../../lib/auth";
import logger from "../../../../lib/logger";
import { GeneratedRecipe } from "../../../../components/GenerateRecipe/RecipeChat";
import { NamedRecipeIngredient } from "../../../../hooks/useChat";

const systemMessage = `You are a helpful assistant, with expert culinary knowledge. You are to update the recipe I give you according to the new instructions. You must give your response in the following JSON format:
    {
      "title": "string",
      "ingredients": [
        {
          "name": "name",
          "amount":"amount",
          "unit":"<UNIT>"
        }
      ]
      "instructions": [
        "instructions_step"
      ],
    }

 The UNIT for the ingredients must be chosen from one of the following options. Values should be uppercase:

  GRAMS,
  INDIVIDUAL,
  MILLILITRES,
  TABLESPOON,
  TEASPOON,
  OUNCE,
  CUP

  Do not prefix the instruction steps with numbers.
    `;

export async function POST(req: NextRequest) {
  let requestId;
  try {
    const body = await req.json();
    const {
      generationRequestId,
      recipe,
    }: { generationRequestId: string; recipe: GeneratedRecipe } = body;
    requestId = generationRequestId;

    const userSession = await auth();
    if (!userSession?.user?.id) {
      return NextResponse.json({
        status: 403,
        error: "Unauthorized",
      });
    }

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (
      !generationRequest ||
      generationRequest.requestType != GENERATION_REQUEST_TYPE.ITERATIVE
    ) {
      return NextResponse.json({
        status: 400,
        message: `[${generationRequestId}] Invalid generation ID for /iterate`,
      });
    }

    /**
     * Set request to in progress
     */
    const promptInsertResponse = await prisma.generationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      },
    });

    const schema = z.object({
      title: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
          unit: z.enum([
            "GRAMS",
            "INDIVIDUAL",
            "MILLILITRES",
            "TABLESPOON",
            "TEASPOON",
            "OUNCE",
            "CUP",
          ]),
        })
      ),
      instructions: z.array(z.string()),
    });

    const userMessage = `Recipe to update: """Name: ${recipe.name}
Ingredients: ${recipe.recipeIngredients
      .map((ingredient) => {
        return `${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`;
      })
      .join("\r\n")}
Instructions: ${recipe.instructions?.instructions.join("\r\n")}
    """
    Update instruction: """${generationRequest.text}"""`;

    logger.log(
      "info",
      `[${generationRequestId}] Requesting generation from service`
    );
    const generationResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          model: "gpt-3.5-turbo-1106",
          response_format: {
            type: "json_object",
          },
          user: userSession.user?.id,
        }),
      }
    );

    logger.log(
      "info",
      `[${generationRequestId}] Response recieved from generation service`
    );

    const responseBody = await generationResponse.json();
    const result = responseBody.choices[0].message.content;
    const jsonResult = JSON.parse(result) as z.infer<typeof schema>;
    schema.parse(jsonResult);

    const recipeInstructions = {
      instructions: jsonResult.instructions,
    };

    /**
     * Insert recipe object
     */
    const recipeInsertResponse = await prisma.recipe.create({
      data: {
        name: jsonResult.title,
        instructions: recipeInstructions,
        promptId: promptInsertResponse.id,
        createdBy: userSession.user.id,
      },
    });

    const generatedIngredients = jsonResult.ingredients.reduce(
      (agg: { [name: string]: { amount: string; unit: UNIT } }, ing) => {
        agg[ing.name.toLocaleLowerCase()] = {
          amount: ing.amount,
          unit: ing.unit,
        };
        return agg;
      },
      {}
    );

    /**
     * Upsert bare ingredients
     */
    const upsertResult = await Promise.all(
      Object.entries(generatedIngredients).map(([ingredientName]) => {
        return prisma.ingredient.upsert({
          where: {
            name: ingredientName.toLocaleLowerCase(),
          },
          create: {
            name: ingredientName.toLocaleLowerCase(),
          },
          update: {},
        });
      })
    );

    /**
     * Insert recipe ingredients
     */
    const units = Object.values(UNIT);
    const namedRecipeIngredients: NamedRecipeIngredient[] = [];
    const recipeIngredients: RecipeIngredient[] = upsertResult.map((upsert) => {
      const generatedIngredient =
        generatedIngredients[upsert.name.toLocaleLowerCase()];

      let amount = numericQuantity(generatedIngredient.amount);
      if (Number.isNaN(amount)) {
        logger.log(
          "info",
          `Amount conversion returned NaN: ${generatedIngredient.amount}`
        );
        amount = 0;
      }

      let unit = generatedIngredient.unit;
      if (!units.includes(generatedIngredient.unit)) {
        logger.log("info", `Invalid unit: ${generatedIngredient.unit}`);
        unit = UNIT.INDIVIDUAL; // TODO - add unknown?
      }

      const fractionalAmount = new Prisma.Decimal(amount);
      const ingredient = {
        recipeId: recipeInsertResponse.id,
        ingredientId: upsert.id,
        amount: fractionalAmount,
        unit: unit,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      namedRecipeIngredients.push({
        ...ingredient,
        amount,
        name: upsert.name,
        id: upsert.id,
      });
      return ingredient;
    });

    await prisma.recipeIngredient.createMany({ data: recipeIngredients });
    await prisma.generationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
      },
    });

    const fullRecipe: GeneratedRecipe = {
      ...recipeInsertResponse,
      recipeIngredients: namedRecipeIngredients,
    };

    logger.log("info", `[${generationRequestId}] Generation completed`);
    return NextResponse.json({ ok: true, generatedRecipe: fullRecipe });
  } catch (e: any) {
    logger.log("error", `[${requestId}] Recipe generation failed`, e);

    await prisma.generationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: GENERATION_REQUEST_STATUS.GENERATION_FAILED,
      },
    });

    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
