"use client";

import Image from "next/image";
import Button from "../UI/Button";
import { useState } from "react";

interface PricingCardProps {
  coins: number;
  price: number;
  onPurchase: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  coins,
  price,
  onPurchase,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = () => {
    setIsLoading(true);
    onPurchase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center hover:shadow-lg hover:scale-[1.025] duration-150">
      <div className="text-xl font-semibold mb-2">{`${coins} Omlete coins`}</div>
      <Image
        src={`/${coins}-coins.png`}
        alt={`${coins} Omlete coins`}
        className="mb-4"
        width={100}
        height={100}
      />
      <div className="text-lg text-gray-700 mb-2">£{price}</div>
      <div className="text-sm text-gray-500 mb-6">One-off payment</div>
      <Button onClick={onClick} disabled={isLoading}>
        {isLoading && (
          <span className="loading loading-spinner loading-sm text-white"></span>
        )}
        {!isLoading && <span>Buy now</span>}
      </Button>
    </div>
  );
};

export default PricingCard;
