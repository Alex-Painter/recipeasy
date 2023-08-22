import React from "react";
import { Recipe } from "./recipes";

const RecipeCard = ({
  recipe,
  setSelected,
}: {
  recipe: Recipe;
  setSelected: (rid: number) => void;
}) => {
  const handleClick = (rid: number) => {
    setSelected(rid);
  };

  return (
    <div
      className="flex w-80 border-solid border-2 border-black rounded"
      onClick={() => handleClick(recipe.rid)}
    >
      <div className={`${recipe.isSelected ? "font-bold" : "font-normal"}`}>
        <div>{recipe.name}</div>
      </div>
    </div>
  );
};

export default RecipeCard;
