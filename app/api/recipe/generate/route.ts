import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import prisma from "../../../../lib/prisma";
import {
  GENERATION_REQUEST_STATUS,
  RecipeIngredient,
  UNIT,
} from "@prisma/client";
import { numericQuantity } from "numeric-quantity";

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

const stateSwitcher = (state: GENERATION_REQUEST_STATUS) => {
  switch (state) {
    case GENERATION_REQUEST_STATUS.GENERATION_COMPLETE:
    // return recipe object
    case GENERATION_REQUEST_STATUS.GENERATION_FAILED:
    // return failure message
    case GENERATION_REQUEST_STATUS.GENERATION_REQUESTED:
    // do normal routine
    case GENERATION_REQUEST_STATUS.GENERATION_PROGRESS:
    // enter DB polling, 1 second frequency, for 10 seconds
    // if not done in that time, send error
  }
};

const TEMPLATE = `Role: Expert chef who can generate new and interesting recipes

Action: Generate a new recipe and cooking instructions from a list of ingredients and keywords

Context: Emphasise the use of common ingredients and easy preparation methods

System Instructions: "Create a unique recipe using the ingredients and keywords provided in input.

Input: {input}`;

export async function POST(req: NextRequest) {
  let requestId;
  try {
    console.log("request");
    const body = await req.json();
    const { generationRequestId, userId } = body;
    requestId = generationRequestId;

    /**
     * TODO - Update this to check the user against the session sent
     */
    if (userId) {
      const dbUser = await prisma.user.findFirst({ where: { id: userId } });
      if (dbUser === null) {
        return NextResponse.json({
          status: 400,
          error: "Invalid user",
        });
      }
    } else {
      return NextResponse.json({
        status: 400,
        error: "Missing user",
      });
    }

    // console.log("server request");
    // return NextResponse.json({ status: 200 });

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (
      !generationRequest ||
      generationRequest.status !==
        GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    ) {
      return NextResponse.json({
        status: 400,
        message: "Invalid generation ID",
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
      temperature: 1.2,
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

    console.log("Sent to chatgpt");
    const result = (await chain.invoke({
      input: generationRequest.text,
    })) as z.infer<typeof schema>;

    const recipeInstructions = {
      instructions: result.instructions,
    };

    const recipeInsertResponse = await prisma.recipe.create({
      data: {
        name: result.title,
        instructions: recipeInstructions,
        promptId: promptInsertResponse.id,
        createdBy: userId,
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

      return {
        recipeId: recipeInsertResponse.id,
        ingredientId: upsert.id,
        amount: amount,
        unit: unit,
        createdAt: upsert.createdAt,
        updatedAt: upsert.updatedAt,
        deletedAt: null,
      };
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

    console.log("done");
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.log(e);

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
