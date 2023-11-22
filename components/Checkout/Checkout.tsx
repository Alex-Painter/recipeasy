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
  user: EnrichedUser | undefined;
  products: StripeProductsWithPrice;
}) => {
  const [snackbar, setSnackbar] = useState<
    { status: "success" | "error"; message: string } | undefined
  >();
  const [isLoading, setIsLoading] = useState<string | undefined>();

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
    setIsLoading(productId);
    const response = await api.POST("checkout_session", {
      productId,
    });

    if (!response.ok) {
      setSnackbar({
        status: "error",
        message:
          "Something went wrong - if your purchase wasn't successful please get in touch!",
      });
      setIsLoading(undefined);
    }

    const responseBody = await response.json();
    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      sessionId: responseBody.session.id,
    });

    if (error) {
      setSnackbar({
        status: "error",
        message:
          "Something went wrong with the checkout - if your purchase wasn't successful please get in touch!",
      });
      setIsLoading(undefined);
    }
  };

  const resetSnackbar = () => {
    setSnackbar(undefined);
  };

  const snackbarMessage = snackbar
    ? snackbar
    : { status: "error", message: "" };

  const timeoutSeconds = snackbar?.message === "error" ? 60 : 8;
  return (
    <>
      <div className="flex flex-col h-full items-center">
        <h2 className="text-4xl mt-24">Recharge your kitchen</h2>
        <h4 className="text-slate-600 mt-8">
          Buy coins as and when you need to continue creating.
        </h4>
        <div className="text-sm text-gray-400 mt-6 text-center">
          1 coin = 1 recipe creation. Subsequent recipe changes are free.
        </div>
        <div className="flex gap-8 flex-wrap justify-center mt-12 mb-6">
          {products.map((product) => {
            return (
              <PricingCard
                key={product.stripeProductId}
                coins={product.coins}
                price={parseFloat(product.price.priceGBP.toString())}
                onPurchase={onPurchase(product.stripeProductId)}
                requiresAuth={user === undefined}
                isLoading={isLoading === product.stripeProductId}
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
        timeoutSeconds={timeoutSeconds}
      />
    </>
  );
};

export default Checkout;
