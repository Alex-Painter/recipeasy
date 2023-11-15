"use client";

import React, { useEffect } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { EnrichedUser } from "../../lib/auth";
import api from "../../lib/api";
import { StripeProductsWithPrice } from "../../hooks/useProducts";
import Image from "next/image";
import Button from "../UI/Button";
import PricingCard from "./PricingCard";

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

  const onPurchase = (productId: string) => async () => {
    const response = await api.POST("checkout_session", {
      productId,
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
    <div className="flex flex-col h-full items-center">
      <h2 className="text-4xl mt-24">Recharge your kitchen</h2>
      <h4 className="text-slate-400 mt-8">
        Buy coins as and when you need them to continue creating
      </h4>
      <div className="flex gap-8 flex-wrap justify-center mt-12 mb-6">
        {products.map((product) => {
          return (
            <PricingCard
              key={product.stripeProductId}
              coins={product.coins}
              price={parseFloat(product.price.priceGBP.toString())}
              onPurchase={onPurchase(product.stripeProductId)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Checkout;
