import React from "react";
import { UserRecipe } from "../../hooks/useRecipes";
import Image from "next/image";

export function formatTimeAgo(createdAt: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - createdAt.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes === 1) {
    return `1 minute ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours === 1) {
    return `1 hour ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return `1 day ago`;
  } else {
    return `${diffInDays} days ago`;
  }
}

interface RecipeCardProps {
  recipe: UserRecipe;
  onClick: (recipeId: number) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const toggleModal = () => {
    onClick(recipe.id);
  };

  const { name, author, createdAt } = recipe;
  const { name: userName, image } = author;
  return (
    <div className="card bordered">
      <figure>{/* Add an image here if you want */}</figure>
      <div className="card-body" onClick={toggleModal}>
        <h2 className="card-title" onClick={toggleModal}>
          {name}
        </h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          {image && (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                marginRight: "10px",
              }}
            >
              <Image
                src={image}
                alt={`Image of ${userName}`}
                width={40}
                height={40}
              />
            </div>
          )}
          <span>
            <span>{userName}</span>
            <span className="ml-2">·</span>
            <span className="ml-2">{formatTimeAgo(createdAt)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
