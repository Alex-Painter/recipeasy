import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { GENERATION_REQUEST_STATUS } from "@prisma/client";
import logger from "../../../../../lib/logger";
import { auth } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  let requestId;
  try {
    const generationRequestId = req.nextUrl.searchParams.get(
      "generationRequestId"
    );

    const userSession = await auth();
    if (!userSession) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    if (!generationRequestId) {
      const message = "Param 'generationRequestId' is required";
      logger.log("info", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }
    requestId = generationRequestId;

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (!generationRequest) {
      const message = `[${generationRequestId}] Couldn't find generation request for ID`;
      logger.log("info", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    if (
      generationRequest.status === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
    ) {
      logger.log("info", `[${generationRequestId}] Recipe generation complete`);
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
          image: true,
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
        const message = `[${generationRequestId}] Unable to find recipe for generation ID`;
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
      logger.log("info", `[${generationRequestId}] Generation in progress`);
      return NextResponse.json({
        message: GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      });
    }

    if (
      generationRequest.status ===
      GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    ) {
      logger.log("info", `[${generationRequestId}] Generation yet to start`);
      return NextResponse.json({
        message: GENERATION_REQUEST_STATUS.GENERATION_REQUESTED,
      });
    }

    const message = `[${generationRequestId}] Something went wrong when polling`;
    return new NextResponse(null, { status: 500, statusText: message });
  } catch (e) {
    const message = `[${requestId}] Something went wrong when polling`;
    logger.log("error", message, e);
    return NextResponse.json({ status: 500, error: e });
  }
}
