"use client"; // make this better at some point

import { useEffect, useState } from "react";

import AppBar from "./AppBar/AppBar";
import RecipeList from "./RecipeList/RecipeList";
import ShoppingList from "./ShoppingList.tsx/ShoppingList";
import { Recipe, recipes as rs } from "./RecipeList/recipes";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setRecipes(rs);
  }, [recipes, setRecipes]);

  const setRecipeSelected = (rid: number) => {
    const r = [...recipes];

    r.forEach((r) => {
      if (r.rid === rid) {
        r.isSelected = !r.isSelected;
      }
    });
    setRecipes(r);
  };

  const selectedRecipes = recipes.filter((r) => r.isSelected);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AppBar />
      <RecipeList recipes={recipes} setRecipeSelected={setRecipeSelected} />
      <ShoppingList selectedRecipes={selectedRecipes} />
    </main>
  );
}
