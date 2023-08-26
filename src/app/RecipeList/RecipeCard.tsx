import React from "react";
import { Recipe } from "./recipes";

const RecipeCard = ({
  recipe,
  setSelected,
}: {
  recipe: Recipe;
  setSelected: (id: number) => void;
}) => {
  const handleClick = (id: number) => {
    setSelected(id);
  };

  return (
    <div className="card card-bordered" onClick={() => handleClick(recipe.id)}>
      <div className="card-body">
        <div
          className={`card-title ${
            recipe.isSelected ? "font-bold" : "font-normal"
          }`}
        >
          <div>{recipe.name}</div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
