import React, { RefObject } from "react";
import Image from "next/image";
import { UserRecipe } from "../../hooks/useRecipes";

const RecipeModal = ({
  selectedRecipe,
  onClose,
  modalRef,
}: {
  selectedRecipe: UserRecipe | undefined;
  onClose: () => void;
  modalRef: RefObject<HTMLDialogElement>;
}) => {
  const dummyRecipe = {
    headerImage: "path/to/image.jpg",
    name: "Delicious Pasta",
    cookingTime: 30,
    ingredients: ["2 cups of pasta", "1/2 cup of olive oil", "1 tomato"],
    instructions: [
      "Boil the pasta.",
      "Add olive oil.",
      "Chop the tomato and add.",
    ],
    recipeIngredients: [
      "Boil the pasta.",
      "Add olive oil.",
      "Chop the tomato and add.",
    ],
  };
  // const recipe = selectedRecipe;

  let recipe = selectedRecipe;
  if (!recipe) {
    return <dialog className="modal" ref={modalRef}></dialog>;
  }

  let instructions = [];
  if (recipe.instructions && typeof recipe.instructions === "object") {
    instructions = recipe.instructions.instructions;
  }
  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box">
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
                <li key={index}>{ingredient.amount}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Cooking instructions:</h3>
            <ol>
              {instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="modal-action mt-6">
          <button className="btn">Add to cookbook</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default RecipeModal;
