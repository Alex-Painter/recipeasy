"use client";

import React, { useEffect, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { EnrichedUser } from "../../lib/auth";
import api from "../../lib/api";
import { StripeProductsWithPrice } from "../../hooks/useProducts";
import PricingCard from "./PricingCard";
import Snackbar from "../UI/Snackbar";

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
  const [snackbar, setSnackbar] = useState<
    { status: "success" | "error"; message: string } | undefined
  >();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setSnackbar({
        status: "success",
        message:
          "Thank you! Your purchase was successfull. Your coins have been added to your balance.",
      });
    }

    if (query.get("canceled")) {
      setSnackbar({
        status: "error",
        message: "Transaction canceled - please try again.",
      });
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

  const resetSnackbar = () => {
    setSnackbar(undefined);
  };

  const snackbarMessage = snackbar
    ? snackbar
    : { status: "error", message: "" };
  return (
    <>
      <div className="flex flex-col h-full items-center">
        <h2 className="text-4xl mt-24">Recharge your kitchen</h2>
        <h4 className="text-slate-400 mt-8">
          Buy coins as and when you need to continue creating
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
      <Snackbar
        status={snackbarMessage.status}
        isOpen={!!snackbar}
        text={snackbarMessage.message}
        onClose={resetSnackbar}
      />
    </>
  );
};

export default Checkout;
