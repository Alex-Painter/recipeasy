import React from "react";

import NewRecipeBody from "./NewRecipe";

const NewRecipe = async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return <div>No api key present</div>;
  }

  return <NewRecipeBody openAIAPIKey={apiKey} />;
};

export default NewRecipe;
