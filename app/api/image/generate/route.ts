// https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";
import { IMAGE_GENERATION_REQUEST_STATUS } from "@prisma/client";
import logger from "../../../../lib/logger";
import prisma from "../../../../lib/prisma";
import { s3Client } from "../../../../lib/bucket";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "../../../../lib/auth";

const TEMPLATE = `Create a image of the following recipe as it would look after cooking. Consider the recipe title as well as the list of ingredients in Input. 
 Try to capture the finished & assembled dish as well as possible. The style should be similar to images found on recipe websites or in recipe books.

Input:`;

export async function POST(req: NextRequest) {
  let requestId;
  try {
    const body = await req.json();
    const { imageGenerationRequestId } = body;
    requestId = imageGenerationRequestId;

    const userSession = await auth();
    if (!userSession) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    const imageGenerationRequest =
      await prisma.imageGenerationRequest.findFirst({
        where: {
          id: imageGenerationRequestId,
        },
        include: {
          recipe: {
            include: {
              recipeIngredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });

    if (!imageGenerationRequest) {
      const message = `[${imageGenerationRequestId}] Invalid generation ID for /image/generate`;
      logger.log("error", message);
      return new NextResponse(null, {
        status: 400,
        statusText: message,
      });
    }

    logger.log("info", "Setting request to in progress");
    /**
     * Set request to in progress
     */
    await prisma.imageGenerationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_PROGRESS,
      },
    });

    const imagePromptInput = `${imageGenerationRequest.recipe.name}:
      ${imageGenerationRequest.recipe.recipeIngredients
        .map((ing) => `${ing.ingredient.name}`)
        .join(",")}`;

    const prompt = `${TEMPLATE} ${imagePromptInput}`;

    logger.log(
      "info",
      `[${requestId}] Requesting image generation from service`
    );
    const generationResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          model: "dall-e-3",
          n: 1,
          style: "natural",
          user: userSession.user?.id,
        }),
      }
    );

    logger.log(
      "info",
      `[${requestId}] Response recieved from image generation service`
    );

    if (!generationResponse.ok) {
      const message = `[${requestId}] Something went wrong generating the image: ${generationResponse.statusText}`;
      logger.log("info", message);
      return new NextResponse(null, { status: 500, statusText: message });
    }

    const responseBody = await generationResponse.json();
    const createdAt = responseBody.created;
    const imageUrl = responseBody.data[0].url;

    const image = await fetch(imageUrl);
    const imageBuffer = await image.arrayBuffer();
    const imageBody = image.body ?? undefined;

    const buf = Buffer.from(imageBuffer);

    if (!imageBody) {
      const message = `[${requestId}] Failed to fetch image from URL`;
      logger.log("info", message);
      return new NextResponse(null, { status: 500, statusText: message });
    }

    logger.log("info", `[${requestId}] Putting generated image into storage`);
    const imagePathname = `${process.env.NODE_ENV}/${requestId}-${createdAt}.png`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME_IMAGES,
        Key: imagePathname,
        Body: buf,
        ContentType: "image/png",
      })
    );

    logger.log("info", `[${requestId}] Image stored, writing URL to DB`);
    const storedImageUrl = `https://${process.env.CLOUD_FRONT_DIST_DOMAIN}.cloudfront.net/${imagePathname}`;
    const updateResponse = await prisma.imageGenerationRequest.update({
      where: { id: requestId },
      data: {
        status: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
        imageUrl: storedImageUrl,
        blobPathname: imagePathname,
        updatedAt: new Date(),
      },
    });

    return new NextResponse(JSON.stringify({ image: updateResponse }), {
      status: 200,
    });
  } catch (e: any) {
    logger.log("error", `[${requestId}] Image generation failed`, e);

    await prisma.imageGenerationRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: IMAGE_GENERATION_REQUEST_STATUS.GENERATION_FAILED,
      },
    });

    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
