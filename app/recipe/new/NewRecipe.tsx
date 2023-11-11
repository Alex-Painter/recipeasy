"use client";

import React, { useState } from "react";
import api from "../../../lib/api";
import Image from "next/image";
import ParsedIngredientsRow, {
  ParsedIngredient,
} from "../../../components/ParsedIngredientRow";

export interface ChatResponse {
  name: string;
  ingredients: ParsedIngredient[];
}

const SAVE_RESULT_MESSAGE_TIMEOUT_MS = 10000;

const NewRecipeBody = () => {
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [draftRecipe, setDraftRecipe] = useState<ChatResponse>();
  const [recipeImage, setRecipeImage] = useState<string>();
  const [saveResponse, setSaveResponse] = useState<{ ok: boolean } | null>();

  const handleFileUpload = (event: any) => {
    setImageLoading(true);
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const imageString = evt.target?.result as string;
      setRecipeImage(imageString);

      const rawBase64 = imageString.split(",")[1];
      const response = await api.POST("recipe/extract", { image: rawBase64 });

      if (response.ok) {
        const responseJSON = await response.json();
        setDraftRecipe(responseJSON.recipe);
        setImageLoading(false);
      } else {
        console.log(response);
        setImageLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const onIngredientUpdate = (
    ingredient: ParsedIngredient,
    ingredientIdx: number
  ) => {
    if (!draftRecipe) {
      return;
    }
    const updatedDraftRecipe = { ...draftRecipe };
    updatedDraftRecipe.ingredients[ingredientIdx] = ingredient;
    setDraftRecipe(updatedDraftRecipe);
  };

  const isSaveDisabled = () => {
    if (saveLoading) {
      return true;
    }

    if (!draftRecipe?.name.length) {
      return true;
    }

    let isDisabled = false;
    draftRecipe.ingredients.forEach((ingredient) => {
      if (!ingredient.name || !ingredient.amount || !ingredient.Unit) {
        isDisabled = true;
        return;
      }
    });

    return isDisabled;
  };

  const onSave = async () => {
    setSaveLoading(true);
    const response = await api.POST("recipe/new", { draftRecipe });
    setSaveResponse({ ok: response.ok });
    setSaveLoading(false);

    setTimeout(() => {
      setSaveResponse(null);
    }, SAVE_RESULT_MESSAGE_TIMEOUT_MS);
  };

  const showInput = !draftRecipe;
  return (
    <div className="container mx-auto flex flex-col">
      <div className="container mx-auto flex flex-col mt-8">
        {showInput && (
          <div className="flex mt-4 justify-center items-center grow w-full">
            <input
              type="file"
              className="file-input w-full max-w-xs"
              onChange={handleFileUpload}
              disabled={imageLoading}
            />
          </div>
        )}
        {draftRecipe && recipeImage && (
          <div className="card card-side bg-base-100 shadow-xl items-center">
            <div className="w-72 m-12">
              <figure>
                <Image
                  src={recipeImage}
                  alt={draftRecipe.name}
                  width={250}
                  height={500}
                />
              </figure>
            </div>
            <div className="card-body h-full">
              <h2 className="card-title">{draftRecipe.name}</h2>
              {draftRecipe.ingredients.map((ingredient, i) => {
                return (
                  <div key={i}>
                    <ParsedIngredientsRow
                      rowIdx={i}
                      parsedIngredient={ingredient}
                      onUpdate={onIngredientUpdate}
                    />
                  </div>
                );
              })}
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  disabled={isSaveDisabled()}
                  onClick={onSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {saveResponse && !saveResponse.ok && (
        <div className="toast">
          <div className="alert alert-error">
            <span>Something went wrong, please try again</span>
          </div>
        </div>
      )}
      {saveResponse && saveResponse.ok && (
        <div className="toast">
          <div className="alert alert-success">
            <span>Recipe saved to cookbook!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRecipeBody;
