import React from "react";
import { Recipe } from "./recipes";
import RecipeCard from "./RecipeCard";

const RecipeList = ({
  recipes,
  setRecipeSelected,
}: {
  recipes: Recipe[];
  setRecipeSelected: (rid: number) => void;
}) => {
  return (
    <>
      <div>Recipe List</div>
      <div className="flex flex-row">
        {recipes.map((r, i) => {
          return (
            <RecipeCard recipe={r} key={i} setSelected={setRecipeSelected} />
          );
        })}
      </div>
    </>
  );
};

export default RecipeList;
