import { RecipeIngredient } from "../../../types/types";
import IngredientsRow from "./IngredientRow";

const IngredientsListOld = ({
  selectedIngredients,
  handleIngredient,
  handleRemoveIngredient,
}: {
  selectedIngredients: RecipeIngredient[];
  handleIngredient: (ingredient: RecipeIngredient) => void;
  handleRemoveIngredient: (id: number) => void;
}) => {
  return (
    <>
      {selectedIngredients.map((si, i) => {
        return (
          <div key={i} className="flex gap-6 items-center">
            <div>{si.name}</div>
            <div>{si.amount}</div>
            <div>{si.Unit}</div>
            <button
              className="btn"
              onClick={() => handleRemoveIngredient(si.id)}
            >
              Remove ingredient
            </button>
          </div>
        );
      })}
      <IngredientsRow
        handleIngredient={handleIngredient}
        rowIdx={selectedIngredients.length + 1}
      />
    </>
  );
};

export default IngredientsListOld;
