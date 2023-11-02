import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import prisma from "../../../../lib/prisma";
import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
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

const TEMPLATE = `Role: Expert chef who can generate new and interesting recipes

Action: Given a recipe and a set of instructions, modify the existing recipe in accordance with the instructions.

Context: Emphasise the use of common ingredients and easy preparation methods

System Instructions: "Update the recipe using the ingredients and keywords provided in input.

Recipe: {recipe}
Input: {input}`;

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

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    /**
     * Function calling is currently only supported with ChatOpenAI models
     */
    const model = new ChatOpenAI({
      temperature: 1,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
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

    /**
     * Bind the function and schema to the OpenAI model.
     * Future invocations of the returned model will always use these arguments.
     *
     * Specifying "function_call" ensures that the provided function will always
     * be called by the model.
     */
    const functionCallingModel = model.bind({
      functions: [
        {
          name: "output_formatter",
          description: "Should always be used to properly format output",
          parameters: zodToJsonSchema(schema),
        },
      ],
      function_call: { name: "output_formatter" },
    });

    const chain = prompt
      .pipe(functionCallingModel)
      .pipe(new JsonOutputFunctionsParser());

    logger.log(
      "info",
      `[${generationRequestId}] Requesting generation from service`
    );

    const inputRecipe = `Name: ${recipe.name}
Ingredients: ${recipe.recipeIngredients
      .map((ingredient) => {
        return `${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`;
      })
      .join("\r\n")}
Instructions: ${recipe.instructions?.instructions.join("\r\n")}
    `;

    const result = (await chain.invoke({
      input: generationRequest.text,
      recipe: inputRecipe,
    })) as z.infer<typeof schema>;
    logger.log(
      "info",
      `[${generationRequestId}] Response recieved from generation service`
    );

    const recipeInstructions = {
      instructions: result.instructions,
    };

    /**
     * Insert recipe object
     */
    const recipeInsertResponse = await prisma.recipe.create({
      data: {
        name: result.title,
        instructions: recipeInstructions,
        promptId: promptInsertResponse.id,
        createdBy: userSession.user.id,
      },
    });

    const generatedIngredients = result.ingredients.reduce(
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
        amount = 0;
      }

      let unit = generatedIngredient.unit;
      if (!units.includes(generatedIngredient.unit)) {
        unit = UNIT.INDIVIDUAL; // TODO - add unknown?
      }

      const ingredient = {
        recipeId: recipeInsertResponse.id,
        ingredientId: upsert.id,
        amount: amount,
        unit: unit,
        createdAt: upsert.createdAt,
        updatedAt: upsert.updatedAt,
        deletedAt: null,
      };
      namedRecipeIngredients.push({
        ...ingredient,
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