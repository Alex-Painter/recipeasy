// https://vercel.com/docs/functions/configuring-functions/duration
// TODO
let duration = process.env.RECIPE_GENERATION_TIMEOUT_SECONDS ?? "5";
export const maxDuration = parseInt(duration, 10);

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

//  Present the recipes in JSON format, ensuring that the recipe follows the JSON schema defined below."

// JSON schema:

// {
//   "title": "string",
//   "ingredients": {
//     "name": {
//       "amount":"amount",
//       "unit":"<UNIT>"
//     }
//   }
//   "instructions": [
//     "instructions_step"
//   ],
// }

const systemMessage = `You are a helpful assistant, with expert culinary knowledge. You are to create new and interesting recipes based on the ingredients I give you. You must give your response in the following JSON format:
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

 The UNIT for the ingredients must be chosen from one of the following options:

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
    const { generationRequestId, userId, createImageRequest } = body;
    requestId = generationRequestId;

    const userSession = await auth();
    if (!userSession) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (
      !generationRequest ||
      generationRequest.requestType != GENERATION_REQUEST_TYPE.GENERATIVE
    ) {
      const message = `[${generationRequestId}] Invalid generation ID for /generate`;
      logger.log("error", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    logger.log(
      "info",
      `[${generationRequestId}] setting request to in progress`
    );
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
              content: generationRequest.text,
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
        createdBy: userId,
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

    const fullRecipe: GeneratedRecipe = {
      ...recipeInsertResponse,
      recipeIngredients: namedRecipeIngredients,
    };

    let imageRequestedCreated = false;
    let imageRequestId;

    if (createImageRequest) {
      imageRequestId = await prisma.imageGenerationRequest
        .create({
          data: {
            parentRequestId: generationRequestId,
            recipeId: fullRecipe.id,
            createdBy: userId,
          },
        })
        .then((response) => response.id);

      imageRequestedCreated = true;
      logger.log(
        "info",
        `[${imageRequestId}] Image generation request created`
      );
    }

    await prisma.generationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
      },
    });

    logger.log("info", `[${generationRequestId}] Generation completed`);
    return NextResponse.json({
      ok: true,
      generatedRecipe: fullRecipe,
      imageRequestedCreated,
      imageRequestId,
    });
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
