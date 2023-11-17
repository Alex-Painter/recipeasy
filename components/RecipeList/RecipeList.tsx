"use client";

import React, { useRef, useState } from "react";

import RecipeCard from "./RecipeCard";
import { UserRecipe } from "../../hooks/useRecipes";
import RecipeModal from "./RecipeModal";
import { useRouter } from "next/navigation";

const RecipeList = ({ recipes }: { recipes: UserRecipe[] }) => {
  const [openRecipeId, setOpenRecipeId] = useState<number | undefined>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const onCardClick = (id: string) => () => {
    // if (modalRef === null || modalRef.current === null) {
    //   return;
    // }
    // setOpenRecipeId(id);
    // modalRef.current.showModal();
    router.push(`/create/${id}`);
  };

  let selectedRecipe = recipes.find((recipe) => recipe.id === openRecipeId);

  if (!selectedRecipe) {
    selectedRecipe = recipes[0];
  }
  return (
    <>
      <div className="container mx-auto max-w-[84rem] mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 gap-x-8 px-4 auto-rows-[15rem]">
          {recipes.map((r, i) => {
            const { name, author, id, prompt } = r;

            if (!name) {
              return;
            }

            const avatarUrl = author.image;
            const title = formatRecipeTitle(name, author.name);
            const imageUrl = r.image?.imageUrl ?? "/wallpaper.png";
            const genereativeId = r.prompt.id;
            return (
              <div key={i} className="justify-self-center w-full">
                <RecipeCard
                  key={i}
                  title={title}
                  avatarUrl={avatarUrl}
                  difficulty="Easy"
                  time="30 mins"
                  initialPrompt={prompt.text}
                  onClick={onCardClick(genereativeId)}
                  imageUrl={imageUrl}
                />
              </div>
            );
          })}
        </div>
      </div>
      <RecipeModal modalRef={modalRef} recipe={selectedRecipe} />
    </>
  );
};

export default RecipeList;

const capitalizeEachStartLetter = (str: string) => {
  const strLower = str.toLocaleLowerCase();
  const words = strLower.split(" ");

  const capFirst = words
    .map((w) => {
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(" ");

  return capFirst;
};

export const formatRecipeTitle = (
  recipeName: string,
  authorName: string | null
): string => {
  let title = `${capitalizeEachStartLetter(recipeName)}`;

  if (authorName) {
    const firstName = authorName.split(" ")[0];
    title = `${firstName}'s ` + title;
  }

  return title;
};
