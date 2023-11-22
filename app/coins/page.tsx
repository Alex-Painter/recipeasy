import React from "react";

import { getCurrentUser } from "../../lib/session";
import Checkout from "../../components/Checkout/Checkout";
import useProducts from "../../hooks/useProducts";

const CheckoutPage = async () => {
  const user = await getCurrentUser();
  const products = await useProducts();

  return (
    <div className="flex flex-col h-full">
      <div className="grow bg-gradient-to-t from-orange-300 from-0% to-white to-50%">
        <Checkout user={user} products={products} />
      </div>
    </div>
  );
};

export default CheckoutPage;
