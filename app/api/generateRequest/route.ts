import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";
import logger from "../../../lib/logger";
import { EnrichedSession, auth } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userSession: EnrichedSession | null = await auth();
    if (!userSession || !userSession?.user?.id) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    const body = await req.json();
    const { text, type } = body;

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

    const generationRequestResponse = await prisma.generationRequest.create({
      data: {
        requestType: type,
        text,
        createdBy: userSession.user.id,
      },
    });

    return NextResponse.json({
      status: 200,
      requestId: generationRequestResponse.id,
    });
  } catch (e) {
    logger.log("error", e);
    return new NextResponse(null, {
      status: 500,
      statusText: `Something went wrong creating the generation request: ${e}`,
    });
  }
}
