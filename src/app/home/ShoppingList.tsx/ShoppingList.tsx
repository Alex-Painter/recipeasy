import React from "react";
import { AmountType, Ingredient, Recipe } from "../RecipeList/recipes";

const ShoppingList = ({ selectedRecipes }: { selectedRecipes: Recipe[] }) => {
  let allIngredients: { [id: number]: Ingredient } = {};
  const combinedIngredients = selectedRecipes.reduce(
    (agg: { [id: number]: number }, r) => {
      r.ingredients.forEach((ing) => {
        allIngredients[ing.id] = ing;
        if (agg[ing.id]) {
          agg[ing.id] += ing.amount;
        } else {
          agg[ing.id] = ing.amount;
        }
      });
      return agg;
    },
    {}
  );

  const formatAmount = (amount: number, amountType: AmountType) => {
    switch (amountType) {
      case AmountType.Grams:
        return `${amount}g`;
      case AmountType.Millilitres:
        return `${amount}ml`;
      default:
        return amount;
    }
  };

  return (
    <div>
      <div className="">Shopping List</div>
      <div className="flex flex-col">
        {Object.entries(combinedIngredients).map(([id, amount]) => {
          const ingredient = allIngredients[id];
          return (
            <li key={id}>
              <span>
                {ingredient.name}: {formatAmount(amount, ingredient.amountType)}
              </span>
            </li>
          );
        })}
      </div>
    </div>
  );
};

export default ShoppingList;
