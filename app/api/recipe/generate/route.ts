import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import prisma from "../../../../lib/prisma";

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

Action: Generate a new recipe and cooking instructions from a list of ingredients and keywords

Context: Emphasise the use of common ingredients and easy preparation methods

System Instructions: "Create a unique recipe using the ingredients and keywords provided in input.

The ingredients <UNIT> MUST be selected from the following enum values: GRAMS, INDIVIDUAL, MILLILITRES, TABLESPOON, TEASPOON, OUNCE, CUP.

Input: {input}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    const userId = body.userId;

    /**
     * Check request user is valid
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

    const currentMessageContent = messages[messages.length - 1].content;

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
      ingredients: z.object({
        name: z.object({
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
        }),
      }),
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

    const result: z.infer<typeof schema> = (await chain.invoke({
      input: currentMessageContent,
    })) as z.infer<typeof schema>;

    const promptInsertResponse = await prisma.generationRequest.create({
      data: {
        requestType: "GENERATIVE",
        createdBy: userId,
        text: currentMessageContent,
      },
    });

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

    // const ingredients = Object.entries(result.ingredients).reduce(
    //   (agg: any, [ingredientName, ingredientMeta]) => {
    //     return {
    //       name: ingredientName,
    //       ...ingredientMeta,
    //     };
    //   },
    //   []
    // );

    const upsertResult = await Promise.all(
      Object.entries(result.ingredients).map(
        ([ingredientName, ingredientMeta]) => {
          return prisma.ingredient.upsert({
            where: {
              name: ingredientName.toLocaleLowerCase(),
            },
            create: {
              name: ingredientName,
            },
            update: {},
          });
        }
      )
    );

    /**
     * Insert recipe ingredients
     */

    console.log(upsertResult);
    // console.log(recipeInsertResponse);
    // console.log(promptInsertResponse);

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
