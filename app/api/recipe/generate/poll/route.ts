import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { GENERATION_REQUEST_STATUS } from "@prisma/client";
import logger from "../../../../../lib/logger";

export async function GET(req: NextRequest) {
  try {
    const generationRequestId = req.nextUrl.searchParams.get(
      "generationRequestId"
    );

    // TODO
    const userId = req.nextUrl.searchParams.get("userId");
    if (!generationRequestId) {
      const message = "Param 'generationRequestId' is required";
      logger.log("info", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (!generationRequest) {
      const message = "Couldn't find generation request for given ID";
      logger.log("info", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    if (
      generationRequest.status === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
    ) {
      logger.log("info", "Recipe generation complete");
      const generatedRecipe = await prisma.recipe.findFirst({
        where: {
          promptId: generationRequestId,
        },
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (generatedRecipe) {
        const newRecipe = { ...generatedRecipe };
        const ingredients = generatedRecipe.recipeIngredients.map(
          (ingredient) => {
            return {
              ...ingredient,
              ...ingredient.ingredient,
            };
          }
        );
        newRecipe.recipeIngredients = ingredients;

        return NextResponse.json({
          message: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
          recipe: newRecipe,
        });
      } else {
        const message = "Unable to find recipe for generation ID";
        logger.log("error", message);
        return new NextResponse(null, {
          status: 500,
          statusText: message,
        });
      }
    }

    if (
      generationRequest.status === GENERATION_REQUEST_STATUS.GENERATION_PROGRESS
    ) {
      logger.log("info", `Request ${generationRequestId} in progress`);
      return NextResponse.json({
        message: GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      });
    }

    const message = "Something went wrong";
    logger.log("error", message);
    return new NextResponse(null, { status: 500, statusText: message });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 500, error: e });
  }
}
