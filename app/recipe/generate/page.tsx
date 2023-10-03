import React from "react";

import GenerateRecipeBody from "../../../components/GenerateRecipe";

const GenerateRecipe = async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return <div>No api key present</div>;
  }

  return <GenerateRecipeBody openAIAPIKey={apiKey} />;
};

export default GenerateRecipe;
