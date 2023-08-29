"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { AmountType } from "@/app/RecipeList/recipes";
import api from "../../../../lib/api";
import { Ingredient } from "@prisma/client";

const AddIngredientsBody = ({
  allIngredients,
}: {
  allIngredients: Ingredient[];
}) => {
  const [saveSuccess, setSaveSuccess] = useState<boolean | undefined>();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const handleAddIngredient = (name: any, amountType: any, id: number) => {
    const newIngredients = [...ingredients];
    newIngredients.push({ name, amountType, id });
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (id: number) => {
    const filteredIngredients = ingredients.filter((i) => i.id !== id);
    setIngredients(filteredIngredients);
  };

  const handleSave = async () => {
    const noIdIngredients = ingredients.map(({ name, amountType }) => ({
      name,
      amountType,
    }));
    const response = await api.POST("ingredient", noIdIngredients);

    if (response.ok) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(undefined);
      }, 5000);
    }
  };

  const isSaveDisabled = () => {
    if (!ingredients.length) {
      return true;
    }

    return false;
  };

  return (
    <div className="container mx-auto flex flex-col mt-8">
      <div className="flex gap-2 flex-col">
        {ingredients.map((si, i) => {
          return (
            <div key={i} className="flex gap-6 items-center">
              <div>{si.name}</div>
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
      </div>
      <IngredientRow
        addIngredient={handleAddIngredient}
        rowIdx={ingredients.length}
      />
      <div className="flex mt-4 gap-2">
        <button
          className="btn"
          onClick={handleSave}
          disabled={isSaveDisabled()}
        >
          Save all
        </button>
        {saveSuccess && (
          <div className="badge badge-success self-center">Saved!</div>
        )}
      </div>
    </div>
  );
};

const IngredientRow = ({
  addIngredient,
  rowIdx,
}: {
  addIngredient: any;
  rowIdx: number;
}) => {
  const [name, setName] = useState("");
  const [amountType, setAmountType] = useState<AmountType>(AmountType.GRAMS);

  const handleIngredientNameChange = (name: any) => {
    setName(name);
  };

  const handleIngredientAmountTypeChange = (type: any) => {
    setAmountType(type);
  };

  const handleIngredient = () => {
    addIngredient(name, amountType, -rowIdx);
    setName("");
    setAmountType(AmountType.GRAMS);
  };

  const isAddDisabled = () => {
    return name.length === 0;
  };

  return (
    <div className="flex items-end gap-2">
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Ingredient name</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={name}
          onChange={(e) => handleIngredientNameChange(e.target.value)}
        />
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Amount type</span>
        </label>
        <select
          className="input input-bordered w-full max-w-xs"
          value={amountType}
          onChange={(e) => handleIngredientAmountTypeChange(e.target.value)}
        >
          <option>{AmountType.GRAMS}</option>
          <option>{AmountType.INDIVIDUAL}</option>
          <option>{AmountType.MILLILITRES}</option>
          <option>{AmountType.TABLESPOON}</option>
          <option>{AmountType.TEASPOON}</option>
        </select>
      </div>
      <div className="flex">
        <button
          className="btn"
          onClick={handleIngredient}
          disabled={isAddDisabled()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default AddIngredientsBody;
