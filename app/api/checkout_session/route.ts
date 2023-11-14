import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "../../../lib/error";
import prisma from "../../../lib/prisma";
import logger from "../../../lib/logger";
import { auth } from "../../../lib/auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const userSession = await auth();
    if (
      !userSession ||
      !userSession.user ||
      !userSession.user.id ||
      !userSession.user.email
    ) {
      return new NextResponse(null, {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    const body = await req.json();
    const { productId } = body;

    const dbProduct = await prisma.stripeProduct.findFirst({
      where: {
        stripeProductId: productId,
      },
      include: {
        price: true,
      },
    });

    if (!dbProduct?.price) {
      const message = `[${productId}] Couldn't find a price for product ID`;
      logger.log("error", message);
      return new NextResponse(null, { status: 400, statusText: message });
    }

    const { stripePriceId } = dbProduct.price;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/?success=true`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      automatic_tax: { enabled: true },
      customer_email: userSession.user.email,
    });

    return new NextResponse(JSON.stringify({ session }));
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    logger.log(
      "error",
      `Something went wrong creating the checkout session: ${errorMessage}`
    );
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
