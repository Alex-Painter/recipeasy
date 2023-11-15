"use client";

import React, { useEffect } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { EnrichedUser } from "../../lib/auth";
import api from "../../lib/api";
import { StripeProductsWithPrice } from "../../hooks/useProducts";
import Image from "next/image";
import Button from "../ui/Button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const Checkout = ({
  user,
  products,
}: {
  user: EnrichedUser;
  products: StripeProductsWithPrice;
}) => {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);

  const onCheckout: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const response = await api.POST("checkout_session", {
      productId: "prod_P03Jy8ayV4FTt0",
    });

    if (!response.ok) {
      alert("something went wrong");
      return;
    }

    const responseBody = await response.json();

    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      sessionId: responseBody.session.id,
    });

    console.warn(error.message);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center mt-16">
      <h2 className="text-4xl font-bold">Recharge your kitchen</h2>
      <div className="flex gap-8 flex-wrap justify-center mt-12 mb-6">
        <PricingCard coins={5} price={5} />
        <PricingCard coins={25} price={15} />
      </div>
    </div>
  );
};

export default Checkout;

interface PricingCardProps {
  coins: number;
  price: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ coins, price }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center">
      <div className="text-xl font-semibold mb-2">{`${coins} Omlete coins`}</div>
      <Image
        src={`/${coins}-coins.png`}
        alt={`${coins} Omelete coins`}
        className="mb-4"
        width={100}
        height={100}
      />
      <div className="text-lg text-gray-700 mb-2">£{price}</div>
      <div className="text-sm text-gray-500 mb-6">One-off payment</div>
      <Button>Buy now</Button>
    </div>
  );
};
