import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";

export async function GET(req: NextRequest, res: NextResponse) {
  const a = await auth();
  console.log(a);
  return new NextResponse(null, { status: 200 });
}
