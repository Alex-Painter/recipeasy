"use client";

import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList/RecipeList";
import ShoppingList from "./ShoppingList.tsx/ShoppingList";
import { Recipe } from "./RecipeList/recipes";

const AppBody = ({ initialRecipes }: { initialRecipes: Recipe[] }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setRecipes(initialRecipes);
  }, [initialRecipes, setRecipes]);

  const setRecipeSelected = (id: number) => {
    const r = [...recipes];

    r.forEach((r) => {
      if (r.id === id) {
        r.isSelected = !r.isSelected;
      }
    });
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
