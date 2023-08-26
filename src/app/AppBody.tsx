"use client";

import React, { useEffect, useState } from "react";
import RecipeList from "./RecipeList/RecipeList";
import ShoppingList from "./ShoppingList.tsx/ShoppingList";
import { Recipe } from "./RecipeList/recipes";
import api from "../../lib/api";
import { Recipe as RecipeDB, RecipeIngredient } from "@prisma/client";

const AppBody = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const getRecipes = async () => {
      const response = await api.GET("recipe");
      const { recipes } = await response.json();

      console.log(recipes);

      const hydratedRecipes = recipes.reduce((agg: Recipe[], r: any) => {
        const hr: any = { ...r, isSelected: false }; // fix 'any' type
        const ingredients = r.recipeIngredients.map((i: any) => {
          return {
            id: i.ingredientId,
            name: i.ingredient.name,
            amount: i.amount,
            amountType: i.ingredient.amountType,
          };
        });

        hr.ingredients = ingredients;
        delete hr.recipeIngredients;
        agg.push(hr);

        return agg;
      }, []);
      setRecipes(hydratedRecipes);
    };

    getRecipes();
  }, [setRecipes]);

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
