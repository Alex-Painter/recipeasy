import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import logger from "../../../lib/logger";
import { EnrichedSession, auth } from "../../../lib/auth";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const userSession: EnrichedSession | null = await auth();
    if (!userSession || !userSession?.user?.id) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    const {
      text,
      type,
      parentId,
    }: {
      text: string | undefined;
      type: GENERATION_REQUEST_TYPE;
      parentId: string | undefined;
    } = await req.json();

    if (!text) {
      return new NextResponse(null, {
        status: 400,
        statusText: "Missing required param 'text'",
      });
    }

    if (!type) {
      return new NextResponse(null, {
        status: 400,
        statusText: "Missing required param 'type'",
      });
    }

    if (type === GENERATION_REQUEST_TYPE.ITERATIVE && !parentId) {
      return new NextResponse(null, {
        status: 400,
        statusText:
          "Missing required param 'parendId' for iterative generation request",
      });
    }

    const generationRequestResponse = await prisma.generationRequest.create({
      data: {
        requestType: type,
        text,
        createdBy: userSession.user.id,
        parentRequestId: parentId,
      },
    });

    return NextResponse.json({
      status: 200,
      request: generationRequestResponse,
    });
  } catch (e) {
    logger.log("error", e);
    return new NextResponse(null, {
      status: 500,
      statusText: `Something went wrong creating the generation request: ${e}`,
    });
  }
}
