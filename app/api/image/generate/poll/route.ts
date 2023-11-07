// TODO - how naughty is this
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { IMAGE_GENERATION_REQUEST_STATUS } from "@prisma/client";
import logger from "../../../../../lib/logger";
import { auth } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  let requestId;
  try {
    const imageGenerationRequestId = req.nextUrl.searchParams.get(
      "imageGenerationRequestId"
    );

    const userSession = await auth();
    if (!userSession) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    if (!imageGenerationRequestId) {
      const message = "Param 'imageGenerationRequestId' is required";
      logger.log("error", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    requestId = imageGenerationRequestId;
    const generationRequest = await prisma.imageGenerationRequest.findFirst({
      where: {
        id: imageGenerationRequestId,
      },
    });

    if (!generationRequest) {
      const message = `[${imageGenerationRequestId}] Couldn't find generation request for ID`;
      logger.log("info", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    if (
      generationRequest.status ===
      IMAGE_GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
    ) {
      logger.log(
        "info",
        `[${imageGenerationRequestId}] Image generation complete`
      );

      return NextResponse.json({
        message: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
        imageRequest: generationRequest,
      });
    }

    if (
      generationRequest.status ===
      IMAGE_GENERATION_REQUEST_STATUS.GENERATION_PROGRESS
    ) {
      logger.log(
        "info",
        `[${imageGenerationRequestId}] Image generation in progress`
      );
      return NextResponse.json({
        message: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      });
    }

    if (
      generationRequest.status ===
      IMAGE_GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    ) {
      logger.log(
        "info",
        `[${imageGenerationRequestId}] Image generation yet to start`
      );
      return NextResponse.json({
        message: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_REQUESTED,
      });
    }

    const message = `[${imageGenerationRequestId}] Something went wrong when polling image generation: `;
    logger.log("error", message);
    logger.log("error", generationRequest.id);
    logger.log("error", generationRequest.status);
    logger.log("error", message);
    return new NextResponse(null, { status: 500, statusText: message });
  } catch (e) {
    const message = `[${requestId}] Something went wrong when polling`;
    logger.log("error", message, e);
    return NextResponse.json({ status: 500, error: e });
  }
}
