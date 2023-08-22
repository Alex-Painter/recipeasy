"use client";

import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList/RecipeList";
import ShoppingList from "./ShoppingList.tsx/ShoppingList";
import { Recipe } from "./RecipeList/recipes";

const AppBody = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // setRecipes([]);
  }, [recipes, setRecipes]);

  const setRecipeSelected = (rid: number) => {
    const r = [...recipes];

    r.forEach((r) => {
      if (r.rid === rid) {
        r.isSelected = !r.isSelected;
      }
    });
    console.log("need to set recipe id to selected");
    setRecipes(r);
  };

  const selectedRecipes = recipes.filter((r) => r.isSelected);

  return (
    <>
      <RecipeList recipes={recipes} setRecipeSelected={setRecipeSelected} />
      <ShoppingList selectedRecipes={selectedRecipes} />
    </>
  );
};

export default AppBody;
