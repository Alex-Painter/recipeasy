"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AmountType,
  Recipe,
  Ingredient,
  RecipeIngredient,
} from "@/app/RecipeList/recipes";
import api from "../../../../lib/api";
import OpenAI from "openai";

const recipePrompt = `I would like you to extract a list of ingredients and their amounts from a recipe which is contained the following text. I would like the list of ingredients formatted in a JSON object, an example of which I will paste below. JSON format: 
  { 
    "name": "string", // name of the recipe
    "ingredients": [
      {
        "name": // ingredient name {
          "amount": "string", // amount in decimals
          "amountType": "string" // amount type
        }
      } 
    ] 
  }. 
  
  Return only the JSON.
  
  Text to extract: `;

interface ChatResponse {
  name: string;
  ingredients: {
    [name: string]: {
      amount: string;
      amountType: string;
    };
  }[];
}

const NewRecipeBody = ({
  allIngredients,
  openAIAPIKey,
}: {
  allIngredients: Ingredient[];
  openAIAPIKey: string;
}) => {
  const [saveSuccess, setSaveSuccess] = useState<boolean | undefined>();
  const [recipe, setRecipe] = useState<Recipe>({
    id: 0,
    name: "",
    ingredients: [],
    isSelected: false,
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [recipeText, setRecipeText] = useState<string>();
  const [chatOutput, setChatOutput] = useState<ChatResponse>();

  useEffect(() => {
    const getCompletion = async () => {
      if (!recipeText?.length) {
        return;
      }

      const openai = new OpenAI({
        apiKey: openAIAPIKey,
        dangerouslyAllowBrowser: true, // FIXME
      });

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: `${recipePrompt}: ${recipeText}` }],
        model: "gpt-3.5-turbo",
      });

      const contentString = completion.choices[0].message.content;
      const recipeObject: ChatResponse = JSON.parse(contentString ?? "");

      console.log(recipeObject);
      setChatOutput(recipeObject);
    };

    getCompletion();
  }, [recipeText, openAIAPIKey]);

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

  const handleSaveRecipe = async () => {
    const recipeResponse = await api.POST("recipe", { name: recipe.name });
    const responseBody = await recipeResponse.json();
    const ri = recipe.ingredients.map((i) => ({
      ingredientId: i.id,
      recipeId: responseBody.id,
      amount: i.amount,
    }));
    const recipeIngredientResponse = await api.POST("recipeIngredient", {
      recipeIngredients: ri,
    });

    if (recipeResponse.ok && recipeIngredientResponse.ok) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(undefined);
      }, 5000);
    }
  };

  const isSaveDisabled = () => {
    if (saveSuccess !== undefined) {
      return true;
    }

    if (recipe.name === "") {
      return true;
    }

    if (!recipe.ingredients.length) {
      return true;
    }

    return false;
  };

  const handleFileUpload = (event: any) => {
    setImageLoading(true);
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const imageString = evt.target?.result as string;

      const rawBase64 = imageString.split(",")[1];
      const response = await fetch(
        "https://r13l1xriw7.execute-api.eu-west-2.amazonaws.com/dev/hello-world-python",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: rawBase64,
          }),
        }
      );

      if (response.ok) {
        const responseJSON = await response.json();
        const text = responseJSON.response.text;
        setRecipeText(text);
        setImageLoading(false);
      } else {
        setImageLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto flex">
      <div className="container mx-auto flex flex-col mt-8">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Recipe name</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={recipe.name}
              onChange={handleNameChange}
            />
            {saveSuccess && (
              <div className="badge badge-success self-center">Saved!</div>
            )}
          </div>
        </div>
        <br></br>
        <IngredientsList
          selectedIngredients={recipe.ingredients}
          allIngredients={allIngredients}
          handleIngredient={handleIngredient}
          handleRemoveIngredient={handleRemoveIngredient}
        />
        <div className="flex mt-4">
          <button
            className="btn"
            onClick={handleSaveRecipe}
            disabled={isSaveDisabled()}
          >
            Save
          </button>
        </div>
      </div>
      <div className="container mx-auto flex flex-col mt-8">
        <div className="flex mt-4 justify-center items-center grow w-full">
          <input
            type="file"
            className="file-input w-full max-w-xs"
            onChange={handleFileUpload}
            disabled={imageLoading}
          />
        </div>
        <div>{recipeText}</div>
      </div>
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
    recipeId: -1,
  });
  const [amount, setAmount] = useState("");

  const handleIngredientChange = (newIngredient: Ingredient) => {
    setLocalIngredient({ ...newIngredient, amount: 0, recipeId: -1 });
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
      recipeId: -1,
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
    <div className="flex flex-row items-end gap-2">
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
          <option>{AmountType.TABLESPOON}</option>
          <option>{AmountType.TEASPOON}</option>
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
