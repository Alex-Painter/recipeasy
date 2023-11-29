import React from "react";

import RecipeCard from "./RecipeCard";
import { UserRecipe } from "../../hooks/useRecipes";

const RecipeList = ({ recipes }: { recipes: UserRecipe[] }) => {
  return (
    <>
      <div className="container mx-auto max-w-[84rem] mb-4">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-y-4 gap-x-8 px-4">
          {recipes.map((r, i) => {
            const { name, author, prompt } = r;
            const { name: username } = author;

            if (!name || !username) {
              return;
            }

            const avatarUrl = author.image;
            const title = formatRecipeTitle(name, author.name);
            const imageUrl = r.image?.imageUrl ?? "/wallpaper.png";
            const genereativeId = r.prompt.id;
            return (
              <li key={i} className="justify-self-center w-full">
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
                  username={username}
                />
              </li>
            );
          })}
        </ul>
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
  return title;
};
