import React from "react";

import RecipeCard from "./RecipeCard";
import { UserRecipe } from "../../hooks/useRecipes";

const RecipeList = ({ recipes }: { recipes: UserRecipe[] }) => {
  return (
    <>
      <div className="container mx-auto max-w-[84rem] mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-y-4 gap-x-8 px-4 auto-rows-[15rem]">
          {recipes.map((r, i) => {
            const { name, author, prompt } = r;

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
                  imageUrl={imageUrl}
                  generativeId={genereativeId}
                  createdAt={r.prompt.createdAt}
                />
              </div>
            );
          })}
        </div>
      </div>
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
