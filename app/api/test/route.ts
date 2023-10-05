import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log(session);
  return NextResponse.json({ ok: true });
}
