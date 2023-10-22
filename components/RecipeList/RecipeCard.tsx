import Image from "next/image";
import React from "react";

type RecipeCardProps = {
  title: string;
  avatarUrl: string;
  time: string;
  difficulty: string;
  initialPrompt: string;
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  avatarUrl,
  time,
  difficulty,
  initialPrompt,
}) => {
  return (
    <div className="card w-80 h-60">
      <div className="bordered rounded-md w-80 h-44 relative overflow-hidden">
        <figure>
          <Image
            src="/pasta.png"
            alt="AI-generated image of the recipe"
            fill={true}
            className="object-cover"
          />
          <div className="absolute rounded-2xl top-0 left-0 bg-orange-400 mx-2 mt-2 px-2 py-1 text-xs">
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
      <div className="absolute bottom-0 left-0 flex items-center space-x-2 px-4 py-2">
        <Image
          src={avatarUrl}
          alt="Image of the recipe author"
          className="rounded-full w-8 h-8"
          width={12}
          height={12}
        />
        <span className=" bg-gray-200 rounded-2xl px-2 py-1 text-xs overflow-hidden text-ellipsis italic">
          {`"${initialPrompt}"`}
        </span>
      </div>
    </div>
  );
};

export default RecipeCard;
