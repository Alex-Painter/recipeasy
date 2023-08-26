import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  console.log(req);
  const body = await req.json();

  if (Array.isArray(body.recipeIngredients)) {
    const response = await prisma.recipeIngredient.createMany({
      data: body.recipeIngredients,
    });
    console.log(response);
  }

  return NextResponse.json({});
}
