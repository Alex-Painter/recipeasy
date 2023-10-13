"use client";

import React, { useRef, useState } from "react";

import RecipeCard from "./RecipeCard";
import { UserRecipe } from "../../hooks/useRecipes";
import RecipeModal from "./RecipeModal";

const RecipeList = ({ recipes }: { recipes: UserRecipe[] }) => {
  const [openRecipeId, setOpenRecipeId] = useState<number | undefined>();
  const modalRef = useRef<HTMLDialogElement>(null);

  const onCardClick = (id: number) => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }
    setOpenRecipeId(id);
    modalRef.current.showModal();
  };

  const handleModalClose = () => {
    setOpenRecipeId(undefined);
  };

  const selectedRecipe = recipes.find((recipe) => recipe.id === openRecipeId);
  return (
    <>
      <div className="container mx-auto">
        <div className="flex flex-row flex-wrap gap-2">
          {recipes.map((r, i) => {
            return <RecipeCard recipe={r} key={i} onClick={onCardClick} />;
          })}
        </div>
      </div>
      {selectedRecipe && (
        <RecipeModal
          selectedRecipe={selectedRecipe}
          modalRef={modalRef}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default RecipeList;
