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
  const [ingredients, setIngredients] = useState<Omit<Ingredient, "id">[]>([]);

  const handleAddIngredient = (name, amountType) => {
    const newIngredients = [...ingredients];
    newIngredients.push({ name, amountType });
    setIngredients(newIngredients);
  };

  const handleSave = async () => {
    const response = await api.POST("ingredient", [...ingredients]);
    console.log(response);
  };

  console.log(ingredients);
  return (
    <div className="container mx-auto flex flex-col mt-8">
      {ingredients.map((si, i) => {
        return (
          <div key={i} className="flex gap-6 items-center">
            <div>{si.name}</div>
            <div>{si.amountType}</div>
            {/* <button
              className="btn"
              onClick={() => handleRemoveIngredient(si.id)}
            >
              Remove ingredient
            </button> */}
          </div>
        );
      })}
      <IngredientRow addIngredient={handleAddIngredient} />
      <button className="btn" onClick={handleSave}>
        Save all
      </button>
    </div>
  );
};

const IngredientRow = ({ addIngredient }: { addIngredient: any }) => {
  const [name, setName] = useState("");
  const [amountType, setAmountType] = useState("");

  const handleIngredientNameChange = (name: any) => {
    setName(name);
  };

  const handleIngredientAmountTypeChange = (type: any) => {
    setAmountType(type);
  };

  const handleIngredient = () => {
    addIngredient(name, amountType);
  };

  return (
    <>
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
        </select>
      </div>
      <button className="btn" onClick={handleIngredient}>
        Add
      </button>
    </>
  );
};

export default AddIngredientsBody;
