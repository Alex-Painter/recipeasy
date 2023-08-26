"use client";

import {
  AmountType,
  Recipe,
  Ingredient,
  RecipeIngredient,
} from "@/app/RecipeList/recipes";
import React, { ChangeEvent, useRef, useState } from "react";

const NewRecipeBody = ({
  allIngredients,
}: {
  allIngredients: Ingredient[];
}) => {
  const [recipe, setRecipe] = useState<Recipe>({
    id: 0,
    name: "",
    ingredients: [],
    isSelected: false,
  });

  const handleNameChange = (nameEvent: ChangeEvent<HTMLInputElement>) => {
    const name = nameEvent.target.value;
    const newRecipe = { ...recipe };
    newRecipe.name = name;
    setRecipe(newRecipe);
  };

  const handleIngredient = (ingredient: RecipeIngredient) => {
    const newRecipe = { ...recipe };
    const updatedIngredients = [...newRecipe.ingredients];

    let existingIngredientIdx = updatedIngredients.findIndex(
      (i) => i.id === ingredient.id
    );

    if (existingIngredientIdx > -1) {
      updatedIngredients[existingIngredientIdx].amount = ingredient.amount;
    } else {
      updatedIngredients.push(ingredient);
    }

    newRecipe.ingredients = updatedIngredients;
    setRecipe(newRecipe);
  };

  const handleRemoveIngredient = (id: number) => {
    const newRecipe = { ...recipe };
    const updatedIngredients = [
      ...newRecipe.ingredients.filter((i) => i.id != id),
    ];
    newRecipe.ingredients = updatedIngredients;
    setRecipe(newRecipe);
  };

  const handleSaveRecipe = () => {
    fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/recipe`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: recipe.name }),
    });
  };

  console.log(recipe);
  return (
    <div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Recipe name</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={recipe.name}
          onChange={handleNameChange}
        />
      </div>
      <br></br>
      <div>Ingredients</div>
      <IngredientsList
        selectedIngredients={recipe.ingredients}
        allIngredients={allIngredients}
        handleIngredient={handleIngredient}
        handleRemoveIngredient={handleRemoveIngredient}
      />
      <button className="btn" onClick={handleSaveRecipe}>
        Save
      </button>
    </div>
  );
};

const IngredientsList = ({
  selectedIngredients,
  allIngredients,
  handleIngredient,
  handleRemoveIngredient,
}: {
  selectedIngredients: RecipeIngredient[];
  allIngredients: Ingredient[];
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
            <div>{si.amountType}</div>
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
        allIngredients={allIngredients}
        handleIngredient={handleIngredient}
        rowIdx={selectedIngredients.length + 1}
      />
    </>
  );
};

const IngredientsRow = ({
  allIngredients,
  handleIngredient,
  rowIdx,
}: {
  allIngredients: Ingredient[];
  handleIngredient: (recipe: RecipeIngredient) => void;
  rowIdx: number;
}) => {
  const [localIngredient, setLocalIngredient] = useState<RecipeIngredient>({
    name: "",
    amountType: AmountType.GRAMS,
    id: -rowIdx,
    amount: 0,
  });
  const [amount, setAmount] = useState("");

  const handleIngredientChange = (newIngredient: Ingredient) => {
    setLocalIngredient({ ...newIngredient, amount: 0 });
  };

  const handleIngredientAmountChange = (amount: string) => {
    setAmount(amount);
  };

  const handleIngredientAdd = () => {
    handleIngredient({ ...localIngredient, amount: parseInt(amount, 10) });
    setLocalIngredient({
      name: "",
      amountType: AmountType.GRAMS,
      id: -rowIdx,
      amount: 0,
    });
    setAmount("");
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

  return (
    <div className="flex flex-row items-end">
      <Autocomplete
        items={allIngredients}
        value={localIngredient.name}
        onChange={handleIngredientChange}
      />
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Amount</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={amount}
          onChange={(e) => handleIngredientAmountChange(e.target.value)}
        />
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Amount type</span>
        </label>
        <select
          className="input input-bordered w-full max-w-xs"
          value={localIngredient.amountType}
          disabled
        >
          <option>{AmountType.GRAMS}</option>
          <option>{AmountType.INDIVIDUAL}</option>
          <option>{AmountType.MILLILITRES}</option>
        </select>
      </div>
      <button
        className="btn"
        onClick={handleIngredientAdd}
        disabled={isAddDisabled()}
      >
        Add
      </button>
    </div>
  );
};

const Autocomplete = ({
  items,
  value,
  onChange,
}: {
  items: Ingredient[];
  value: string;
  onChange: (ingredient: Ingredient) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const dropdownOpen = open ? "dropdown-open" : "";
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Ingredient name</span>
      </label>
      <div className={`dropdown dropdown-end w-full ${dropdownOpen}`} ref={ref}>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Type something..."
          value={value}
          tabIndex={0}
          readOnly={true}
        />
        <div className="dropdown-content bg-base-200 top-14 max-h-96 overflow-auto flex-col rounded-md">
          <ul
            className="menu menu-compact "
            // use ref to calculate the width of parent
            style={{ width: ref.current?.clientWidth }}
          >
            {items.map((item, index) => {
              return (
                <li
                  key={index}
                  tabIndex={index + 1}
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className="border-b border-b-base-content/10 w-full"
                >
                  <button>{item.name}</button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewRecipeBody;
