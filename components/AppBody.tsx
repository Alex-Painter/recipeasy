import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList/RecipeList";
import useRecipes from "../hooks/useRecipes";

const AppBody = async () => {
  const recipes = await useRecipes();
  return (
    <>
      <RecipeList recipes={recipes} />
    </>
  );
};

export default AppBody;
