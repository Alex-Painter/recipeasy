import React from "react";
import { Recipe } from "./recipes";
import RecipeCard from "./RecipeCard";
import Link from "next/link";

const RecipeList = ({
  recipes,
  setRecipeSelected,
}: {
  recipes: Recipe[];
  setRecipeSelected: (id: number) => void;
}) => {
  const handleNewRecipe = () => {
    // navigate to wizard
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-row flex-wrap gap-2">
        {recipes.map((r, i) => {
          return (
            <RecipeCard recipe={r} key={i} setSelected={setRecipeSelected} />
          );
        })}
        <Link href="/recipe/generate">
          <div className="card card-bordered" onClick={handleNewRecipe}>
            <div className="card-body">
              <div className="card-title">
                <div>Create new reicpe</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default RecipeList;
