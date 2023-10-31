import { UNIT } from "@prisma/client";
import { formatAmount } from "./ShoppingList.tsx/ShoppingList";
import Image from "next/image";
import { formatRecipeTitle } from "./RecipeList/RecipeList";

type Ingredient = {
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
  username: string | null | undefined;
  avatarUrl?: string | null;
  prompt?: string;
}

const RecipeDetailsCard = ({
  title,
  ingredients,
  instructions,
  username,
  avatarUrl,
  prompt,
}: RecipeDetailsCardProps) => {
  const isLoading = !title || !ingredients || !instructions || !username;
  return (
    <div>
      <Header title={title} username={username} />
      {prompt && avatarUrl && (
        <div className="flex items-center">
          <UserPrompt prompt={prompt} avatarUrl={avatarUrl} />
        </div>
      )}
      <hr className="my-4" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
        <div className="mr-8">
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <div className="grid">
            {ingredients &&
              ingredients.map((ingredient, index) => (
                <IngredientRow key={index} ingredient={ingredient} />
              ))}
            {isLoading && <LoadingRows />}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 mt-4 md:mt-0">Instructions</h3>
          <div className="grid">
            {instructions &&
              instructions.instructions.map((step, index) => (
                <div key={index} className="mb-2">
                  <InstructionRow instruction={step} stepNum={index + 1} />
                </div>
              ))}
            {isLoading && <LoadingRows />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsCard;

const IngredientRow = ({ ingredient }: { ingredient: Ingredient }) => {
  return (
    <>
      <div className="flex justify-between">
        <span className="">{capitalizeFirstChar(ingredient.name)}</span>
        <span className="text-end">
          {formatAmount(ingredient.amount, ingredient.unit)}
        </span>
      </div>
      <hr className="mb-3" />
    </>
  );
};

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

const InstructionRow = ({
  instruction,
  stepNum,
}: {
  instruction: string;
  stepNum: number;
}) => {
  return (
    <div className="flex flex-col">
      <div>
        <div>Step {stepNum}.</div>
        <hr className="mb-3" />
      </div>
      <div className="prose mb-2">{instruction}</div>
    </div>
  );
};

const capitalizeFirstChar = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
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
