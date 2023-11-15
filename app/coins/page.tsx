import React from "react";

import { getCurrentUser } from "../../lib/session";
import Checkout from "../../components/Checkout/Checkout";
import useProducts from "../../hooks/useProducts";

const CheckoutPage = async ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  const { generationPromptId } = params;
  const user = await getCurrentUser();
  const products = await useProducts();

  if (!user) {
    return <></>;
  }

  return (
    <div className="container mx-auto h-full">
      <Checkout user={user} products={products} />
    </div>
  );
};

export default CheckoutPage;
