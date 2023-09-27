"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AmountType,
  Recipe,
  Ingredient,
  RecipeIngredient,
} from "@/app/RecipeList/recipes";
import api from "../../../../lib/api";

interface ChatResponse {
  name: string;
  ingredients: {
    name: string;
    amount: string;
    amountType: string;
    alternativeNames?: string[];
  }[];
}

const NewRecipeBody = ({ openAIAPIKey }: { openAIAPIKey: string }) => {
  const [saveSuccess, setSaveSuccess] = useState<boolean | undefined>();
  const [recipe, setRecipe] = useState<Recipe>({
    id: 0,
    name: "",
    ingredients: [],
    isSelected: false,
  });
  const [activeTab, setActiveTab] = useState("image");
  const [imageLoading, setImageLoading] = useState(false);
  const [draftRecipe, setDraftRecipe] = useState<ChatResponse>();
  const [recipeText, setRecipeText] = useState<string>();

  const handleFileUpload = (event: any) => {
    setImageLoading(true);
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const imageString = evt.target?.result as string;

      const rawBase64 = imageString.split(",")[1];
      const response = await api.POST("recipe/generate", { image: rawBase64 });

      // TODO
      if (response.ok) {
        const responseJSON = await response.json();
        console.log(responseJSON);
        setDraftRecipe(responseJSON);
        setImageLoading(false);
      } else {
        console.log(response);
        setImageLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto flex flex-col">
      <div className="tabs tabs-boxed">
        <a
          className={`tab tab-lg tab-lifted ${
            activeTab === "image" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("image")}
        >
          Extract from image
        </a>
      </div>
      {activeTab === "image" && (
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
      )}
    </div>
  );
};

export default NewRecipeBody;
