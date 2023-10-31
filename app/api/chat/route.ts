import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { GENERATION_REQUEST_TYPE, GenerationRequest } from "@prisma/client";
import { auth } from "../../../lib/auth";
import logger from "../../../lib/logger";

export async function GET(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession) {
      return NextResponse.json({
        status: 403,
        error: "Unauthorized",
      });
    }

    const generationRequestId = req.nextUrl.searchParams.get(
      "generationRequestId"
    );

    /**
     * Check request contains correct params
     */
    if (!generationRequestId) {
      return NextResponse.json({
        status: 400,
        error: "Param 'generationRequestId' is required",
      });
    }

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        requestType: GENERATION_REQUEST_TYPE.GENERATIVE,
        id: generationRequestId,
      },
    });

    /**
     * Check requested generation exists in DB
     */
    if (!generationRequest) {
      const message = `Failed to find generative request for id: ${generationRequestId}`;
      logger.log("info", message);
      return NextResponse.json({
        status: 500,
        error: message,
      });
    }

    /**
     * Get all iterative requests that are children of the top-level generative request
     */
    const interativeRequests = await prisma.generationRequest.findMany({
      where: {
        requestType: GENERATION_REQUEST_TYPE.ITERATIVE,
        parentRequestId: generationRequestId,
      },
    });

    /**
     * Get all recipes & ingredients for all request IDs
     */
    const allRequests = [generationRequest, ...interativeRequests];
    const ids = [...allRequests.map((r) => r.id)];
    const recipes = await prisma.recipe.findMany({
      where: {
        promptId: {
          in: ids,
        },
      },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    /**
     * Format recipe and ingredients correctly
     */
    const formattedRecipes = recipes.map((r) => {
      const newRecipe = { ...r };
      const ingredients = r.recipeIngredients.map((ingredient) => {
        return {
          ...ingredient,
          ...ingredient.ingredient,
        };
      });
      newRecipe.recipeIngredients = ingredients;
      return newRecipe;
    });

    /**
     * Format response
     */
    const chat = allRequests
      .map((re) => {
        const requestRecipe = formattedRecipes.find(
          (rec) => rec.promptId === re.id
        );

        if (!requestRecipe) {
          throw Error(
            `[${re.id}] Failed to find queried recipe for generation ID`
          );
        }

        return {
          request: re,
          recipe: requestRecipe,
        };
      })
      .sort((a, b) => (a.recipe.updatedAt > b.recipe.updatedAt ? 0 : -1));

    return NextResponse.json({
      status: 200,
      chat: chat,
    });
  } catch (e) {
    logger.log("error", e);
    return NextResponse.json({ status: 500, error: e });
  }
}
