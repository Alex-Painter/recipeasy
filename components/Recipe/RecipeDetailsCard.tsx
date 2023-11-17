import { UNIT } from "@prisma/client";
import Image from "next/image";
import { formatRecipeTitle } from "../RecipeList/RecipeList";
import IngredientsList from "./IngredientsList";
import StepList from "./StepList";

export type Ingredient = {
  recipeId: number;
  ingredientId: number;
  amount: number;
  unit: UNIT;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
} & {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface RecipeDetailsCardProps {
  title: string | undefined;
  ingredients: Ingredient[] | undefined;
  instructions: PrismaJson.RecipeInstructions | null | undefined;
  avatarUrl?: string | null;
  prompt?: string;
  imageUrl: string | undefined | null;
  imageLoading: boolean;
}

const RecipeDetailsCard = ({
  title,
  ingredients,
  instructions,
  avatarUrl,
  prompt,
  imageUrl,
  imageLoading,
}: RecipeDetailsCardProps) => {
  return (
    <div className="h-full">
      {prompt && avatarUrl && (
        <div className="flex items-center">
          <UserPrompt prompt={prompt} avatarUrl={avatarUrl} />
        </div>
      )}
      <div className="gap-4 grid grid-rows-[12rem,4rem] md:grid-rows-[16rem,4rem,6fr] md:grid-flow-col md:auto-cols-fr">
        <div className="bordered rounded-md overflow-hidden relative">
          {imageUrl && !imageLoading && (
            <figure>
              <Image
                src={imageUrl}
                fill={true}
                alt="AI-generated image of the recipe"
                className="object-cover"
              />
            </figure>
          )}
          <div className="flex h-full w-full justify-center items-center bg-white">
            {!imageUrl && imageLoading && (
              <span className="loading loading-spinner text-warning"></span>
            )}
            {!imageUrl && !imageLoading && (
              <figure>
                <Image
                  src={"/wallpaper.png"}
                  fill={true}
                  alt="AI-generated image of the recipe"
                  className="object-cover"
                />
              </figure>
            )}
          </div>
        </div>
        <div className="flex bg-white p-4 rounded-xl text-sm font-bold items-center">
          {title}
        </div>
        <div className="bg-white p-4 rounded-xl overflow-auto">
          <IngredientsList ingredients={ingredients} />
        </div>
        <div className="bg-white p-4 rounded-xl overflow-auto md:row-span-3">
          <StepList instructions={instructions} />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsCard;

const LoadingRows = () => {
  return (
    <>
      <LoadingRow />
      <LoadingRow />
      <LoadingRow />
      <LoadingRow />
      <LoadingRow />
      <LoadingRow />
      <LoadingRow />
    </>
  );
};

const LoadingRow = () => {
  return (
    <div className="mb-4">
      <div className="animate-pulse rounded-2xl w-64 h-6 bg-gray-300 mb-1"></div>
      <hr className="mb-3" />
    </div>
  );
};

type HeaderProps = {
  title: string | undefined;
  username: string | null | undefined;
};

const Header: React.FC<HeaderProps> = ({ title, username }) => {
  if (!title || !username) {
    return (
      <div className="animate-pulse rounded-2xl w-64 h-8 space-x-2 bg-gray-300"></div>
    );
  }

  const header = formatRecipeTitle(title, username);
  return (
    <div className="flex items-center space-x-2 ${loadingClasses}">
      <span className="text-xl font-bold">{header}</span>
    </div>
  );
};

interface UserPromptProps {
  prompt: string;
  avatarUrl: string | null;
}

const UserPrompt: React.FC<UserPromptProps> = ({ prompt, avatarUrl }) => {
  return (
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
      <div className="bg-blue-500 rounded-3xl py-1 px-3 text-white text-xs">
        {prompt}
      </div>
    </div>
  );
};
