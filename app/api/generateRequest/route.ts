import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, userId } = body;

    if (!text) {
      return NextResponse.json({ status: 400, error: "Missing prompt text" });
    }

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

    const generationRequestResponse = await prisma.generationRequest.create({
      data: {
        requestType: GENERATION_REQUEST_TYPE.GENERATIVE,
        text,
        createdBy: userId,
      },
    });

    return NextResponse.json({
      status: 200,
      requestId: generationRequestResponse.id,
    });
  } catch (e) {
    logger.log("error", e);
    return NextResponse.json({ status: 500, error: e });
  }
}
