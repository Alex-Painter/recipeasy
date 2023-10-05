import React, { useEffect, useState } from "react";

import RecipeCard from "./RecipeCard";
import useRecipes from "../../hooks/useRecipes";

const RecipeList = async () => {
  const recipes = await useRecipes();
  return (
    <div className="container mx-auto">
      <div className="flex flex-row flex-wrap gap-2">
        {recipes.map((r, i) => {
          return <RecipeCard recipe={r} key={i} />;
        })}
      </div>
    </div>
  );
};

export default RecipeList;
