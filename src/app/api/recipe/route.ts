import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.name) {
    const response = await prisma.recipe.create({
      data: { name: body.name },
    });
    console.log(response);
  }

  return NextResponse.json({});
}
