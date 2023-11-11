import React from "react";
import { Recipe, Ingredient } from "../../types/types";
import { UNIT } from "@prisma/client";

export const formatAmount = (amount: number, unit: UNIT) => {
  switch (unit) {
    case UNIT.GRAMS:
      return `${amount}g`;
    case UNIT.MILLILITRES:
      return `${amount}ml`;
    case UNIT.TABLESPOON:
      return `${amount} tbsp(s)`;
    case UNIT.TEASPOON:
      return `${amount} tsp(s)`;
    case UNIT.OUNCE:
      return `${amount} ounce(s)`;
    case UNIT.CUP:
      return `${amount} cup(s)`;
    case UNIT.CLOVES:
      return `${amount} clove(s)`;
    case UNIT.INDIVIDUAL:
      return `${amount}`;
    default:
      return amount;
  }
};

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

  return (
    <div>
      <div className="">Shopping List</div>
      <div className="flex flex-col">
        {Object.entries(combinedIngredients).map(([id, amount]) => {
          const ingredient = allIngredients[parseInt(id, 10)];
          return (
            <li key={id}>
              <span>{ingredient.name}</span>
            </li>
          );
        })}
      </div>
    </div>
  );
};

export default ShoppingList;
