import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "../../../lib/error";
import logger from "../../../lib/logger";

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;
const stripe = require("stripe")(webhookSecret);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const buf = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const error = getErrorMessage(err);
    logger.log("error", `❌ Error message: ${error}`);
    return new NextResponse(null, { status: 400, statusText: error });
  }

  console.log("✅ Success:", event.id);
  return new NextResponse(null, { status: 200 });
}
