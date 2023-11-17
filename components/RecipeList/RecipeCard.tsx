import Image from "next/image";
import React from "react";

type RecipeCardProps = {
  title: string;
  avatarUrl: string | null;
  time: string;
  difficulty: string;
  initialPrompt: string;
  imageUrl: string;
  onClick: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  avatarUrl,
  time,
  difficulty,
  initialPrompt,
  imageUrl,
  onClick,
}) => {
  return (
    <div className="card flex h-full">
      <div
        className="bordered rounded-md grow overflow-hidden relative hover:shadow-lg hover:cursor-pointer hover:scale-[1.025] duration-150"
        onClick={onClick}
      >
        <figure>
          <Image
            src={imageUrl}
            alt="AI-generated image of the recipe"
            fill={true}
            className="object-cover "
          />
          <div className="absolute rounded-2xl top-0 left-0 bg-bg-orange mx-2 mt-2 px-2 py-1 text-xs">
            {title}
          </div>
          <div className="absolute bottom-0 left-0 flex items-center space-x-2 px-2 py-2 text-xs">
            <span className=" bg-gray-100 rounded-2xl px-2 py-1">{time}</span>
            <span className=" bg-gray-100 rounded-2xl px-2 py-1">
              {difficulty}
            </span>
          </div>
        </figure>
      </div>
      <div className="flex items-center space-x-2 py-2">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="Image of the recipe author"
            className="rounded-full w-8 h-8"
            width={12}
            height={12}
          />
        )}
        {!avatarUrl && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <div className="bg-gray-300 rounded-3xl py-1 px-3 text-xs">
          {initialPrompt}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
