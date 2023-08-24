import React from "react";

import NewRecipeBody from "./NewRecipe";
import useIngredients from "@/hooks/useIngredients";

const NewRecipe = async () => {
  const allIngredients = await useIngredients();

  return <NewRecipeBody allIngredients={allIngredients} />;
};

export default NewRecipe;
