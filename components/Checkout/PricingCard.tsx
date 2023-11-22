import Image from "next/image";
import Button from "../UI/Button";

interface PricingCardProps {
  coins: number;
  price: number;
  onPurchase: () => void;
  requiresAuth: boolean;
  isLoading: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  coins,
  price,
  onPurchase,
  requiresAuth,
  isLoading,
}) => {
  return (
    <div className="bg-white max-w-sm rounded-lg shadow-md p-12 flex flex-col items-center hover:shadow-lg hover:scale-[1.025] duration-150">
      <h2 className="text-xl font-semibold mb-2">{`${coins} Omlete coins`}</h2>
      <Image
        src={`/${coins}-coins.png`}
        alt={`${coins} Omlete coins`}
        className="mb-4"
        width={100}
        height={100}
      />
      <div className="text-lg text-gray-700 mb-2">£{price}</div>
      <div className="text-sm text-gray-400 mb-4 text-center">
        One-time payment
      </div>
      {!requiresAuth && (
        <Button onClick={onPurchase} disabled={isLoading}>
          {isLoading && (
            <span className="loading loading-spinner loading-sm text-white"></span>
          )}
          {!isLoading && <span>Buy now</span>}
        </Button>
      )}
      {requiresAuth && (
        <Button disabled={true}>
          <span>Sign in to purchase coins</span>
        </Button>
      )}
    </div>
  );
};

export default PricingCard;
