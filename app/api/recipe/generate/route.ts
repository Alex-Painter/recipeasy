import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import prisma from "../../../../lib/prisma";
import {
  CoinTransactionType,
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

const systemMessage = `You are a helpful culinary assistant with expert culinary knowledge. Your task is to help the user create a tasty recipe based on their requirements. They will provide you with a list of ingredients they have and you should respond with a full recipe. You should consider common recipes those ingredients are used in, as well as recipes that contain other ingredients commonly found in home kitchens. You should provide the necessary ingredients to satisfy the recipe, along with the ingredients amounts and units of measurements. You should also provide a thorough set of instructions to prepare the recipe. The instructions should be very detailed. You should assume the user has little or no culinary skill, so needs detailed instructions.

The user might also provide you with a recipe name, for example stir fry. You should response with a common recipe for that input, using any addition ingredients they provide. For example, if they input "Stir fry with garlic", you should provide a common stir fry recipe that includes garlic.

You must give your response in the following JSON format:
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
  CUP,
  CLOVES

  Do not prefix the instruction steps with numbers.
    `;

const PRICE_GENERATIVE = parseInt(process.env.PRICE_GENERATIVE!, 10);

export async function POST(req: NextRequest) {
  let requestId;
  try {
    const body = await req.json();
    const { generationRequestId, userId, createImageRequest } = body;
    let shouldGenerateImage =
      process.env.NODE_ENV === "development" ? false : createImageRequest;
    requestId = generationRequestId;

    const userSession = await auth();
    if (!userSession || !userSession?.user?.coinBalance) {
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

    if (userSession.user.coinBalance - PRICE_GENERATIVE < 0) {
      logger.log(
        "error",
        `[${generationRequestId}] User has insuffient coins to process the generation request`
      );
      return new NextResponse(null, {
        status: 403,
        statusText: "Insufficient coins",
      });
    }

    logger.log(
      "info",
      `[${generationRequestId}] Setting request to in progress`
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
          unit: z.string(),
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

    logger.log(
      "info",
      `Recipe generation tokens: ${responseBody.usage.total_tokens}`
    );

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
          unit: ing.unit.toLocaleUpperCase() as UNIT,
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
          `[${generationRequestId}] Amount conversion returned NaN: ${generatedIngredient.amount}`
        );

        const strippedAmount = numericQuantity(
          generatedIngredient.amount.split(" ")[0]
        );

        if (!Number.isNaN(numericQuantity(strippedAmount))) {
          amount = numericQuantity(strippedAmount);
        } else {
          amount = 0;
        }
      }

      let unit = generatedIngredient.unit;
      if (!units.includes(generatedIngredient.unit)) {
        logger.log(
          "info",
          `[${generationRequestId}] Invalid unit: ${generatedIngredient.unit}`
        );
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
    let imageRequest;
    if (shouldGenerateImage) {
      imageRequest = await prisma.imageGenerationRequest.create({
        data: {
          parentRequestId: generationRequestId,
          recipeId: fullRecipe.id,
          createdBy: userId,
        },
      });

      imageRequestedCreated = true;
      logger.log(
        "info",
        `[${imageRequest.id}] Image generation request created`
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

    await prisma.coinTransaction.create({
      data: {
        amount: PRICE_GENERATIVE,
        transactionType: CoinTransactionType.USED,
        userId: userId,
      },
    });

    const newBalance = userSession.user.coinBalance - PRICE_GENERATIVE;
    await prisma.coinBalance.update({
      where: {
        userId: userId,
      },
      data: {
        balance: newBalance,
        updateAt: new Date(),
      },
    });

    fullRecipe.image = imageRequest;
    logger.log("info", `[${generationRequestId}] Generation completed`);
    return NextResponse.json({
      generatedRecipe: fullRecipe,
      imageRequestedCreated,
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
