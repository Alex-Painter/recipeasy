import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "../../../../lib/error";
import logger from "../../../../lib/logger";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      logger.log("error", `Couldn't find user when confirming dialog`);
      return new NextResponse(null, {
        status: 400,
        statusText: "Couldn't find valid user when confirming dialog",
      });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        newUser: false,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    logger.log(
      "error",
      `Something went wrong confirming the dialog: ${errorMessage}`
    );
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
