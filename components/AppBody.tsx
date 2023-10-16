import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList/RecipeList";
import useRecipes from "../hooks/useRecipes";

const AppBody = async () => {
  const recipes = await useRecipes();
  return (
    <div className="">
      <RecipeList recipes={recipes} />
    </div>
  );
};

export default AppBody;
