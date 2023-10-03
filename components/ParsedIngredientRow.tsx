import { useEffect, useState } from "react";
import { capitalize } from "lodash";

import { AmountType, RecipeIngredient } from "./RecipeList/recipes";
import { numericQuantity } from "numeric-quantity";

export interface ParsedIngredient {
  name: string;
  amount: string;
  amountType: string;
  exactMatch: boolean;
  alternativeNames: string[];
  alternativeDbIds?: number[];
}

const ParsedIngredientsRow = ({
  rowIdx,
  parsedIngredient,
  onUpdate,
}: {
  rowIdx: number;
  parsedIngredient: ParsedIngredient;
  onUpdate: (ingredient: ParsedIngredient, ingredientIdx: number) => void;
}) => {
  const [localIngredient, setLocalIngredient] = useState<
    | Omit<RecipeIngredient, "amountType"> & {
        amountType: AmountType | "UNKNOWN";
      }
  >({
    name: "",
    amountType: AmountType.GRAMS,
    id: -rowIdx,
    amount: 0,
    recipeId: -1,
  });

  useEffect(() => {
    const parsedAmount = parseAmount(parsedIngredient.amount);
    const parsedUnit = parseUnit(parsedIngredient.amountType);
    setLocalIngredient({
      name: parsedIngredient.name,
      amountType: parsedUnit,
      id: -rowIdx,
      amount: parsedAmount,
      recipeId: -1,
    });
  }, [parsedIngredient, rowIdx]);

  const handleNameChange = (name: string) => {
    const newIngredient = { ...parsedIngredient };
    newIngredient.name = name;
    onUpdate(newIngredient, rowIdx);
  };

  const handleIngredientAmountChange = (amount: string) => {
    const newIngredient = { ...parsedIngredient };
    newIngredient.amount = amount;
    onUpdate(newIngredient, rowIdx);
  };

  const handleIngredientUnitChange = (value: string) => {
    const newIngredient = { ...parsedIngredient };
    newIngredient.amountType = value.toLocaleUpperCase();
    onUpdate(newIngredient, rowIdx);
  };

  const { exactMatch, alternativeNames } = parsedIngredient;
  const hasNameUpdated =
    !exactMatch && localIngredient.name !== parsedIngredient.name;
  return (
    <div className="flex flex-col mt-2">
      <div className="flex flex-row items-center gap-2">
        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            className="input input-bordered w-full max-w-xs"
            value={localIngredient.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            className="input input-bordered w-full max-w-xs"
            value={localIngredient.amount}
            onChange={(e) => handleIngredientAmountChange(e.target.value)}
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <select
            className="input input-bordered w-full max-w-xs"
            value={localIngredient.amountType}
            onChange={(e) => handleIngredientUnitChange(e.target.value)}
          >
            <option value="UNKNOWN">Select unit...</option>
            <option value={AmountType.GRAMS}>
              {capitalize(AmountType.GRAMS)}
            </option>
            <option value={AmountType.OUNCE}>
              {capitalize(AmountType.OUNCE)}
            </option>
            <option value={AmountType.CUP}>{capitalize(AmountType.CUP)}</option>
            <option value={AmountType.MILLILITRES}>
              {capitalize(AmountType.MILLILITRES)}
            </option>
            <option value={AmountType.TABLESPOON}>
              {capitalize(AmountType.TABLESPOON)}
            </option>
            <option value={AmountType.TEASPOON}>
              {capitalize(AmountType.TEASPOON)}
            </option>
            <option value={AmountType.INDIVIDUAL}>
              {capitalize(AmountType.INDIVIDUAL)}
            </option>
          </select>
        </div>
      </div>
      <div>
        {!exactMatch && alternativeNames?.length && !hasNameUpdated && (
          <SubstitutionMessage
            name={parsedIngredient.name}
            altNames={alternativeNames}
            handleNameChange={handleNameChange}
          />
        )}
        {hasNameUpdated && (
          <Undo handleClick={() => handleNameChange(parsedIngredient.name)} />
        )}
      </div>
    </div>
  );
};

const Undo = ({ handleClick }: any) => {
  return (
    <span
      className="text-sm text-slate-500 pl-1 underline cursor-pointer"
      onClick={handleClick}
    >
      Undo
    </span>
  );
};

const SubstitutionMessage = ({ name, altNames, handleNameChange }: any) => {
  return (
    <>
      <span className="text-sm text-slate-500 pl-1">{`We couldn't find a match for '${name}' - did you mean `}</span>
      <IngredientSubstitution
        subText={altNames[0]}
        handleClick={handleNameChange}
      ></IngredientSubstitution>
      <span className="text-sm text-slate-500 ">{` or `}</span>
      <IngredientSubstitution
        subText={altNames[1]}
        handleClick={handleNameChange}
      ></IngredientSubstitution>
      <span className="text-sm text-slate-500">?</span>
    </>
  );
};

const IngredientSubstitution = ({
  subText,
  handleClick,
}: {
  subText: string;
  handleClick: (name: string) => void;
}) => {
  return (
    <span
      className="text-sm text-slate-400 underline cursor-pointer"
      onClick={() => handleClick(subText)}
    >
      {subText}
    </span>
  );
};

// need to test
const parseAmount = (amount: string): number => {
  const attempt = numericQuantity(amount, { round: 2 });
  if (Number.isNaN(attempt)) {
    return 0;
  }

  return attempt;
};

// TODO - we shouldn't do this everytime we update the list - only the first time we parse the http response
const parseUnit = (unit: string): AmountType | "UNKNOWN" => {
  const unitLower = unit.toLocaleLowerCase();
  const attempt = unitNames[unitLower];
  if (!attempt) {
    return "UNKNOWN";
  }

  return attempt;
};

const unitNames: { [name: string]: AmountType } = {
  tbsp: AmountType.TABLESPOON,
  tbsps: AmountType.TABLESPOON,
  tablespoons: AmountType.TABLESPOON,
  "table spoon": AmountType.TABLESPOON,
  tablespoon: AmountType.TABLESPOON,
  "table spoons": AmountType.TABLESPOON,
  "tble spoon": AmountType.TABLESPOON,
  tsp: AmountType.TEASPOON,
  tsps: AmountType.TEASPOON,
  teaspoon: AmountType.TEASPOON,
  cup: AmountType.CUP,
  cups: AmountType.CUP,
  oz: AmountType.OUNCE,
  ozs: AmountType.OUNCE,
  ounce: AmountType.OUNCE,
  grams: AmountType.GRAMS,
  gram: AmountType.GRAMS,
  grs: AmountType.GRAMS,
  grms: AmountType.GRAMS,
  grm: AmountType.GRAMS,
  ml: AmountType.MILLILITRES,
  mls: AmountType.MILLILITRES,
  milliliters: AmountType.MILLILITRES,
  millilitres: AmountType.MILLILITRES,
  millilitre: AmountType.MILLILITRES,
  individual: AmountType.INDIVIDUAL,
};

export default ParsedIngredientsRow;
