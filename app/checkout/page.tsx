import React, { useEffect } from "react";
import { getCurrentUser } from "../../lib/session";

import Checkout from "../../components/Checkout/Checkout";

const CheckoutPage = async ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  const { generationPromptId } = params;
  const user = await getCurrentUser();

  if (!user) {
    return <></>;
  }

  return <Checkout user={user} />;
};

export default CheckoutPage;
