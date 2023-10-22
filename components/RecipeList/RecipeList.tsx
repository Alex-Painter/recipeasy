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

  const selectedRecipe = recipes.find((recipe) => recipe.id === openRecipeId);
  return (
    <>
      <div className="container mx-auto">
        <div className="flex flex-row flex-wrap gap-4 place-content-around">
          {recipes.map((r, i) => {
            const { name, author } = r;
            const avatarUrl = author.image ?? "/logo-img.jpg"; //TODO
            return (
              <RecipeCard
                key={i}
                title={name}
                avatarUrl={avatarUrl}
                difficulty="Easy"
                time="30 mins"
                initialPrompt="prawns, lemon, parsely, italian, creme fraiche"
              />
            );
          })}
        </div>
      </div>
      <RecipeModal selectedRecipe={selectedRecipe} modalRef={modalRef} />
    </>
  );
};

export default RecipeList;
