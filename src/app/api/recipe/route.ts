import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let response;
  if (body.name) {
    response = await prisma.recipe.create({
      data: { name: body.name },
    });
    console.log(response);
  }

  if (response) {
    return NextResponse.json({ id: response.id });
  }
  return NextResponse.json({ error: true });
}
