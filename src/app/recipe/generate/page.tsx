import React from "react";

import GenerateRecipeBody from "./GenerateRecipe";
import useIngredients from "@/hooks/useIngredients";

const GenerateRecipe = async () => {
  const allIngredients = await useIngredients();
  const apiKey = process.env.OPENAI_API_KEY;

  return (
    <GenerateRecipeBody allIngredients={allIngredients} openAIAPIKey={apiKey} />
  );
};

export default GenerateRecipe;
