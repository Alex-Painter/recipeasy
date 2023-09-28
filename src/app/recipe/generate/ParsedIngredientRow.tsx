import { AmountType, RecipeIngredient } from "@/app/RecipeList/recipes";
import { parse } from "path";
import { useEffect, useState } from "react";

interface ParsedIngredient {
  name: string;
  amount: string;
  amountType: string;
  exactMatch: boolean;
  alternativeNames?: string[];
}

const ParsedIngredientsRow = ({
  handleIngredient,
  rowIdx,
  parsedIngredient,
}: {
  handleIngredient?: (recipe: RecipeIngredient) => void;
  rowIdx: number;
  parsedIngredient: ParsedIngredient;
}) => {
  const [localIngredient, setLocalIngredient] = useState<RecipeIngredient>({
    name: "",
    amountType: AmountType.GRAMS,
    id: -rowIdx,
    amount: 0,
    recipeId: -1,
  });
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const parsedAmount = parseInt(parsedIngredient.amount, 10);
    setLocalIngredient({
      name: parsedIngredient.name,
      amountType: AmountType.GRAMS, //TODO
      id: -rowIdx,
      amount: parsedAmount,
      recipeId: -1,
    });
  }, [parsedIngredient, rowIdx]);

  const handleIngredientAmountChange = (amount: string) => {
    setAmount(amount);
  };

  const handleIngredientAdd = () => {
    // handleIngredient({ ...localIngredient, amount: parseInt(amount, 10) });
    // setLocalIngredient({
    //   name: "",
    //   amountType: AmountType.GRAMS,
    //   id: -rowIdx,
    //   amount: 0,
    //   recipeId: -1,
    // });
    // setAmount("");
  };

  const isAddDisabled = () => {
    if (!localIngredient.name || !amount) {
      return true;
    }

    const reg = /[^0-9\.\s]/g;
    const found = amount.match(reg);

    if (found && found.length) {
      return true;
    }

    return false;
  };

  const handleNameChange = (name: string) => {
    setLocalIngredient({
      ...localIngredient,
      name,
    });
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
            value={amount}
            onChange={(e) => handleIngredientAmountChange(e.target.value)}
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <select
            className="input input-bordered w-full max-w-xs"
            value={localIngredient.amountType}
            disabled
          >
            <option>{AmountType.GRAMS}</option>
            <option>{AmountType.INDIVIDUAL}</option>
            <option>{AmountType.MILLILITRES}</option>
            <option>{AmountType.TABLESPOON}</option>
            <option>{AmountType.TEASPOON}</option>
          </select>
        </div>
        {parsedIngredient.exactMatch && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <g color="green">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </g>
          </svg>
        )}
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

export default ParsedIngredientsRow;
