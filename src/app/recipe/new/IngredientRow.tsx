import { AmountType, RecipeIngredient } from "@/app/RecipeList/recipes";
import { useState } from "react";

const IngredientsRow = ({
  handleIngredient,
  rowIdx,
}: {
  handleIngredient: (recipe: RecipeIngredient) => void;
  rowIdx: number;
}) => {
  const [localIngredient, setLocalIngredient] = useState<RecipeIngredient>({
    name: "",
    amountType: AmountType.GRAMS,
    id: -rowIdx,
    amount: 0,
    recipeId: -1,
  });
  const [amount, setAmount] = useState("");

  const handleIngredientAmountChange = (amount: string) => {
    setAmount(amount);
  };

  const handleIngredientAdd = () => {
    handleIngredient({ ...localIngredient, amount: parseInt(amount, 10) });
    setLocalIngredient({
      name: "",
      amountType: AmountType.GRAMS,
      id: -rowIdx,
      amount: 0,
      recipeId: -1,
    });
    setAmount("");
  };

  const isAddDisabled = () => {
    if (!localIngredient.name || !amount) {
      return true;
    }

    const reg = /[^0-9\.\s]/g;
    const found = amount.match(reg);

    if (found && found.length) {
      return true;
    }

    return false;
  };

  return (
    <div className="flex flex-row items-end gap-2">
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Amount</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={amount}
          onChange={(e) => handleIngredientAmountChange(e.target.value)}
        />
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Amount type</span>
        </label>
        <select
          className="input input-bordered w-full max-w-xs"
          value={localIngredient.amountType}
          disabled
        >
          <option>{AmountType.GRAMS}</option>
          <option>{AmountType.INDIVIDUAL}</option>
          <option>{AmountType.MILLILITRES}</option>
          <option>{AmountType.TABLESPOON}</option>
          <option>{AmountType.TEASPOON}</option>
        </select>
      </div>
      <button
        className="btn"
        onClick={handleIngredientAdd}
        disabled={isAddDisabled()}
      >
        Add
      </button>
    </div>
  );
};

export default IngredientsRow;
