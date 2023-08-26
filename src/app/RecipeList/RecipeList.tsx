import React from "react";
import { Recipe } from "./recipes";
import RecipeCard from "./RecipeCard";

const RecipeList = ({
  recipes,
  setRecipeSelected,
}: {
  recipes: Recipe[];
  setRecipeSelected: (id: number) => void;
}) => {
  return (
    <div className="container mx-auto">
      <div className="flex flex-row flex-wrap gap-2">
        {recipes.map((r, i) => {
          return (
            <RecipeCard recipe={r} key={i} setSelected={setRecipeSelected} />
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;
