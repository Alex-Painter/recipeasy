import { formatAmount } from "../ShoppingList.tsx/ShoppingList";
import { Ingredient } from "./RecipeDetailsCard";

type IngredientsListProps = {
  ingredients: Ingredient[] | undefined;
};

const IngredientsList = ({ ingredients }: IngredientsListProps) => {
  return (
    <>
      <h3 className="font-semibold mb-2">Ingredients</h3>
      <div className="grid">
        {ingredients &&
          ingredients.map((ingredient, index) => (
            <IngredientRow key={index} ingredient={ingredient} />
          ))}
        {/* {isLoading && <LoadingRows />} */}
      </div>
    </>
  );
};

export default IngredientsList;

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

const capitalizeFirstChar = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};
