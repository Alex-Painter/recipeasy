import React from "react";

import NewRecipeBody from "./NewRecipe";
import useIngredients from "@/hooks/useIngredients";

const NewRecipe = async () => {
  const allIngredients = await useIngredients();
  const apiKey = process.env.OPENAI_API_KEY;

  return (
    <NewRecipeBody allIngredients={allIngredients} openAIAPIKey={apiKey} />
  );
};

export default NewRecipe;
