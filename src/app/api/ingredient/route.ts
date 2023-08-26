import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.name && body.amountType) {
    const response = await prisma.ingredient.create({
      data: { name: body.name, amountType: body.amountType },
    });
    console.log(response);
  } else {
    console.log("request params incorrect");
  }

  return NextResponse.json({});
}
