import React from "react";

import GenerateRecipeBody from "./GenerateRecipe";
import useIngredients from "@/hooks/useIngredients";

const GenerateRecipe = async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return <div>No api key present</div>;
  }

  return <GenerateRecipeBody openAIAPIKey={apiKey} />;
};

export default GenerateRecipe;
