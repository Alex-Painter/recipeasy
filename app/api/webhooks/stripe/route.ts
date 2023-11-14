import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "../../../../lib/error";
import logger from "../../../../lib/logger";
import prisma from "../../../../lib/prisma";
import Stripe from "stripe";

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const fulfillOrder = async (
  customerEmail: string,
  items: Stripe.ApiList<Stripe.LineItem>
): Promise<{ status: number; statusText: string }> => {
  if (items.data.length !== 1 || !items.data[0].price) {
    return {
      status: 400,
      statusText: "Unsupported line item object from session",
    };
  }

  const itemData = items.data[0];
  const user = await prisma.user.findFirst({
    where: {
      email: customerEmail,
    },
  });

  if (!user) {
    return {
      status: 400,
      statusText: `User not found for customer_email: ${customerEmail}`,
    };
  }

  const stripeProduct = await prisma.stripeProduct.findFirst({
    where: {
      priceId: itemData.price?.id,
    },
    include: {
      price: true,
    },
  });

  if (!stripeProduct || !stripeProduct.price) {
    return {
      status: 400,
      statusText: `Couldn't find product or price with price ID: ${itemData.price?.id}`,
    };
  }

  const coinBalance = await prisma.coinBalance.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!coinBalance) {
    return {
      status: 400,
      statusText: `Coin balance not found for customer_email: ${customerEmail}`,
    };
  }

  const updateResponse = await prisma.coinBalance.update({
    where: {
      userId: user.id,
    },
    data: {
      balance: coinBalance.balance + stripeProduct.coins,
      updateAt: new Date(),
    },
  });

  if (!updateResponse) {
    return {
      status: 500,
      statusText: `Failed to update coin balance for customer_email: ${customerEmail}`,
    };
  }

  return {
    status: 200,
    statusText: `Successfully updated coin balance`,
  };
};

export async function POST(req: NextRequest) {
  const buf = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const error = getErrorMessage(err);
    logger.log("error", `Failed to parse stripe webhook event: ${error}`);
    return new NextResponse(null, { status: 400, statusText: error });
  }

  let response: NextResponse;
  switch (event.type) {
    case "checkout.session.completed":
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        }
      );
      const { line_items: lineItems, customer_email: customerEmail } =
        sessionWithLineItems;

      if (!customerEmail || !lineItems) {
        logger.log(
          "error",
          `[${sessionWithLineItems.id}] Can't process stripe webhook event without session.customer_email or session.line_items`
        );
        response = new NextResponse(null, { status: 400 });
        break;
      }

      const fulfillResponse = await fulfillOrder(customerEmail, lineItems);
      if (fulfillResponse.status === 200) {
        logger.log(
          "info",
          `[${sessionWithLineItems.id}] Checkout session successfully fulfilled: ${fulfillResponse.statusText}`
        );
        response = new NextResponse(null, {
          status: fulfillResponse.status,
          statusText: fulfillResponse.statusText,
        });
        break;
      } else {
        logger.log(
          "error",
          `[${sessionWithLineItems.id}] Failed to fulfill checkout session: ${fulfillResponse.statusText}`
        );
        response = new NextResponse(null, {
          status: fulfillResponse.status,
          statusText: fulfillResponse.statusText,
        });
        break;
      }

    default:
      logger.log(
        "info",
        `[${event.id}] Received unsupported stripe event type: ${event.type}`
      );
      response = new NextResponse(null, { status: 400 });
      break;
  }

  return response;
}
