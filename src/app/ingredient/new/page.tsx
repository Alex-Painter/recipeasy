import React from "react";

import AddIngredientsBody from "./AddIngredients";
import useIngredients from "@/hooks/useIngredients";

const NewRecipe = async () => {
  const allIngredients = await useIngredients();

  return <AddIngredientsBody allIngredients={allIngredients} />;
};

export default NewRecipe;
