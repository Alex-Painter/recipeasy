"use client";

import React, { useEffect } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { EnrichedUser } from "../../lib/auth";
import api from "../../lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const Checkout = ({ user }: { user: EnrichedUser }) => {
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
    <form onSubmit={onCheckout}>
      <section>
        <button type="submit" role="link">
          Checkout
        </button>
      </section>
      <style jsx>
        {`
          section {
            background: #ffffff;
            display: flex;
            flex-direction: column;
            width: 400px;
            height: 112px;
            border-radius: 6px;
            justify-content: space-between;
          }
          button {
            height: 36px;
            background: #556cd6;
            border-radius: 4px;
            color: white;
            border: 0;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
          }
          button:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </form>
  );
};

export default Checkout;
