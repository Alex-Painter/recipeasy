import React, { RefObject } from "react";

import RecipeDetailsCard from "../Recipe/RecipeDetailsCard";
import { UserRecipe } from "../../hooks/useRecipes";

interface RecipeModalProps {
  modalRef: RefObject<HTMLDialogElement>;
  recipe: UserRecipe | undefined;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ modalRef, recipe }) => {
  if (!recipe) {
    return <></>;
  }

  const {
    name: title,
    instructions,
    prompt,
    recipeIngredients: ingredients,
  } = recipe;
  const { image: avatarUrl } = recipe.author;
  const imageUrl = recipe.image?.imageUrl;
  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-6xl max-h-[calc(100dvh-2rem)] modal-top">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <RecipeDetailsCard
          title={title}
          ingredients={ingredients}
          instructions={instructions}
          avatarUrl={avatarUrl}
          prompt={prompt.text}
          imageUrl={imageUrl}
          imageLoading={false}
        />
      </div>
      <form method="dialog" className="modal-backdrop cursor-default">
        <button />
      </form>
    </dialog>
  );
};

export default RecipeModal;
