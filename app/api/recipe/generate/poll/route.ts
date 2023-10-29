import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { GENERATION_REQUEST_STATUS } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    console.log("poll request");
    const generationRequestId = req.nextUrl.searchParams.get(
      "generationRequestId"
    );
    const userId = req.nextUrl.searchParams.get("userId");

    console.log(generationRequestId);

    if (!generationRequestId) {
      return NextResponse.json({ status: 400, error: "Bad request id" });
    }

    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
    });

    if (!generationRequest) {
      console.log("couldn't find request");
      return NextResponse.json({ status: 400, error: "Bad request id" });
    }

    if (
      generationRequest.status === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
    ) {
      console.log("request status is complete");
      const generatedRecipe = await prisma.recipe.findFirst({
        where: {
          promptId: generationRequestId,
        },
      });

      if (generatedRecipe) {
        // send back recipes?
        return NextResponse.json({
          status: 200,
          message: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
          recipe: generatedRecipe,
        });
      } else {
        return NextResponse.json({
          status: 500,
          error: "couldn't find generated recipe",
        });
      }
    }

    if (
      generationRequest.status === GENERATION_REQUEST_STATUS.GENERATION_PROGRESS
    ) {
      console.log("request status in progress");
      return NextResponse.json({
        status: 200,
        message: GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      });
    }

    console.log(generationRequest);
    console.log("request status other");
    return new NextResponse("ok");
  } catch (e) {
    console.log(e);
    return NextResponse.json({ status: 500, error: e });
  }
}
