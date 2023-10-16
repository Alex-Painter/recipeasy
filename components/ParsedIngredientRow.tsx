import { useEffect, useState } from "react";
import { capitalize } from "lodash";

import { Unit, RecipeIngredient } from "../types/types";
import { numericQuantity } from "numeric-quantity";

export interface ParsedIngredient {
  name: string;
  amount: string;
  Unit: string;
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
    | Omit<RecipeIngredient, "Unit"> & {
        Unit: Unit | "UNKNOWN";
      }
  >({
    name: "",
    Unit: Unit.GRAMS,
    id: -rowIdx,
    amount: 0,
    recipeId: -1,
  });

  useEffect(() => {
    const parsedAmount = parseAmount(parsedIngredient.amount);
    const parsedUnit = parseUnit(parsedIngredient.Unit);
    setLocalIngredient({
      name: parsedIngredient.name,
      Unit: parsedUnit,
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
    newIngredient.Unit = value.toLocaleUpperCase();
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
            value={localIngredient.Unit}
            onChange={(e) => handleIngredientUnitChange(e.target.value)}
          >
            <option value="UNKNOWN">Select unit...</option>
            <option value={Unit.GRAMS}>{capitalize(Unit.GRAMS)}</option>
            <option value={Unit.OUNCE}>{capitalize(Unit.OUNCE)}</option>
            <option value={Unit.CUP}>{capitalize(Unit.CUP)}</option>
            <option value={Unit.MILLILITRES}>
              {capitalize(Unit.MILLILITRES)}
            </option>
            <option value={Unit.TABLESPOON}>
              {capitalize(Unit.TABLESPOON)}
            </option>
            <option value={Unit.TEASPOON}>{capitalize(Unit.TEASPOON)}</option>
            <option value={Unit.INDIVIDUAL}>
              {capitalize(Unit.INDIVIDUAL)}
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
const parseUnit = (unit: string): Unit | "UNKNOWN" => {
  const unitLower = unit.toLocaleLowerCase();
  const attempt = unitNames[unitLower];
  if (!attempt) {
    return "UNKNOWN";
  }

  return attempt;
};

const unitNames: { [name: string]: Unit } = {
  tbsp: Unit.TABLESPOON,
  tbsps: Unit.TABLESPOON,
  tablespoons: Unit.TABLESPOON,
  "table spoon": Unit.TABLESPOON,
  tablespoon: Unit.TABLESPOON,
  "table spoons": Unit.TABLESPOON,
  "tble spoon": Unit.TABLESPOON,
  tsp: Unit.TEASPOON,
  tsps: Unit.TEASPOON,
  teaspoon: Unit.TEASPOON,
  cup: Unit.CUP,
  cups: Unit.CUP,
  oz: Unit.OUNCE,
  ozs: Unit.OUNCE,
  ounce: Unit.OUNCE,
  grams: Unit.GRAMS,
  gram: Unit.GRAMS,
  grs: Unit.GRAMS,
  grms: Unit.GRAMS,
  grm: Unit.GRAMS,
  ml: Unit.MILLILITRES,
  mls: Unit.MILLILITRES,
  milliliters: Unit.MILLILITRES,
  millilitres: Unit.MILLILITRES,
  millilitre: Unit.MILLILITRES,
  individual: Unit.INDIVIDUAL,
};

export default ParsedIngredientsRow;
