import React, { RefObject } from "react";
import Image from "next/image";
import { UserRecipe } from "../../hooks/useRecipes";
import { formatAmount } from "../ShoppingList.tsx/ShoppingList";

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
          <span>Cooking Time: 30 mins</span>
          <span className="ml-4">
            Ingredients: {recipe.recipeIngredients.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-medium mb-4">Ingredients:</h3>
            <ul>
              {recipe.recipeIngredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name}
                  {": "}
                  {formatAmount(ingredient.amount, ingredient.unit)}
                </li>
              ))}
            </ul>
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

        <div className="modal-action mt-6">
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
