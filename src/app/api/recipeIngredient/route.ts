import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  console.log(req);
  const body = await req.json();

  console.log(body);
  if (Array.isArray(body.recipeIngredients) && body.recipeIngredients.length) {
    const response = await prisma.recipeIngredient.createMany({
      data: body.recipeIngredients,
    });
    console.log(response);
  } else {
    console.log("recipeIngredients req error");
  }

  return NextResponse.json({});
}
