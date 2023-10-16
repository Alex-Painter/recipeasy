import React, { RefObject } from "react";
import Image from "next/image";
import { UserRecipe } from "../../hooks/useRecipes";
import { formatAmount } from "../ShoppingList.tsx/ShoppingList";
import { UNIT } from "@prisma/client";

const RecipeModal = ({
  selectedRecipe,
  modalRef,
}: {
  selectedRecipe: UserRecipe | undefined;
  modalRef: RefObject<HTMLDialogElement>;
}) => {
  let recipe = selectedRecipe;
  if (!recipe) {
    return <dialog className="modal" ref={modalRef}></dialog>;
  }

  let instructionsList: string[] = [];
  const { instructions } = recipe;
  if (instructions) {
    instructionsList = instructions.instructions;
  }
  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-6xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>

        <h2 className="text-xl font-bold mt-4">{recipe.name}</h2>

        <div className="text-sm mt-2">
          <span>Cooking time: {recipe.cookingTimeMinutes} minutes</span>
          <span className="ml-2">·</span>
          <span className="ml-2">
            Ingredients: {recipe.recipeIngredients.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-medium mb-4">Ingredients:</h3>
            <div className="grid grid-cols-2">
              <ul>
                {recipe.recipeIngredients.map((ingredient, index) => (
                  <NameRow key={index} ingredient={ingredient} />
                ))}
              </ul>
              <ul>
                {recipe.recipeIngredients.map((ingredient, index) => (
                  <AmountRow key={index} ingredient={ingredient} />
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">Cooking instructions:</h3>
            <ol>
              {instructionsList.map((step: string, index: number) => (
                <li key={index} className="mb-6">
                  {`${index + 1}. `} {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="modal-action mt-6 sticky bottom-0">
          <button className="btn">Add to cookbook</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
};

export default RecipeModal;

type Ingredient = {
  recipeId: number;
  ingredientId: number;
  amount: number;
  unit: UNIT;
} & {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

const NameRow = ({ ingredient }: { ingredient: Ingredient }) => {
  return <li className="mb-1">{capitalizeFirstChar(ingredient.name)}</li>;
};

const AmountRow = ({ ingredient }: { ingredient: Ingredient }) => {
  return (
    <li className="mb-1">{formatAmount(ingredient.amount, ingredient.unit)}</li>
  );
};

const capitalizeFirstChar = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};
