"use client";

import OpenAI from "openai";
import React, { useState } from "react";

const GenerateRecipeBody = ({ openAIAPIKey }: { openAIAPIKey: string }) => {
  const [meal, setMeal] = useState("dinner");
  const [portions, setPortions] = useState(2);
  const [ingredients, setIngredients] = useState(
    "Pasta, creme fraice, spinach, chili flakes"
  );
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [allClause, setAllClause] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // send prompt to api
    const prompt = `You are to act as a personal chef, and should generate interesting and fun recipes when prompted. I want you to create a ${meal} recipe using the following ingredients. You can add other ingredients to the recipe. You ${
      allClause ? "" : "do not"
    } need to use all the ingredients. Please provide amounts in metric for the ingredients, enough to create ${portions} portions. I would like the response to be formatted in JSON like: {
      "title", // recipe title
        "ingredients", // list of ingredients
        "steps"; // how to cook the recipe
    }
    
    Ingredients: ${ingredients}`;

    const openai = new OpenAI({
      apiKey: openAIAPIKey,
      dangerouslyAllowBrowser: true, // FIXME
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const contentString = completion.choices[0].message.content;
    const recipeObject = JSON.parse(contentString ?? "");

    console.log(recipeObject);
    setResponse(recipeObject);
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-center gap-6">
        <div>{meal}</div>
        <div>{portions}</div>
        <div>
          {ingredients.split(",").map((i) => {
            return <li key={i}>{i.trim()}</li>;
          })}
        </div>
      </div>
      <div className="flex flex-col items-center mt-6">
        <StepMealType onChange={setMeal} meal={meal} />
      </div>
      <div className="flex flex-col items-center">
        <StepMealPortions onChange={setPortions} portions={portions} />
      </div>
      <div className="flex flex-col items-center">
        <StepIngredients onChange={setIngredients} ingredients={ingredients} />
      </div>
      <div className="flex flex-col items-center">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Force use all ingredients</span>
            <input
              type="checkbox"
              className="toggle"
              checked={allClause}
              onChange={(e) => setAllClause(!allClause)}
            />
          </label>
        </div>
        <button onClick={handleGenerate} className="btn" disabled={loading}>
          Generate
        </button>
      </div>

      {loading && (
        <div>
          <span className="loading loading-spinner loading-xs"></span>
        </div>
      )}
      {response && !loading && (
        <div className="flex flex-col w-full mx-auto">
          <h1>{response.title}</h1>
          <div className="flex gap-6">
            <div className="w-400">
              {response.ingredients.map((i) => {
                return (
                  <li key={i}>
                    {i.ingredient}: {i.amount}
                  </li>
                );
              })}
            </div>
            <div className="w-400">
              <ol>
                {response.steps.map((s) => {
                  return <li key={s}>{s}</li>;
                })}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StepMealType = ({
  onChange,
  meal,
}: {
  onChange: any;
  meal: string | undefined;
}) => {
  const setMealType = (meal: string) => {
    onChange(meal);
  };

  return (
    <>
      <h1 className="self-start">Meal type</h1>
      <div className="flex gap-6">
        <StepCard
          text="Dinner"
          handleClick={() => setMealType("dinner")}
          isSelected={meal === "dinner"}
        />
        <StepCard
          text="Lunch"
          handleClick={() => setMealType("lunch")}
          isSelected={meal === "lunch"}
        />
        <StepCard
          text="Breakfast"
          handleClick={() => setMealType("breakfast")}
          isSelected={meal === "breakfast"}
        />
      </div>
    </>
  );
};

const StepMealPortions = ({
  onChange,
  portions,
}: {
  onChange: any;
  portions: number | undefined;
}) => {
  const handlePortions = (portions: number) => {
    onChange(portions);
  };

  return (
    <>
      <h1 className="self-start">Number of portions</h1>
      <div className="flex gap-6">
        <StepCard
          text="2"
          handleClick={() => handlePortions(2)}
          isSelected={portions === 2}
        />
        <StepCard
          text="3"
          handleClick={() => handlePortions(3)}
          isSelected={portions === 3}
        />
        <StepCard
          text="4"
          handleClick={() => handlePortions(4)}
          isSelected={portions === 4}
        />
      </div>
    </>
  );
};

const StepIngredients = ({
  onChange,
  ingredients,
}: {
  onChange: any;
  ingredients: string;
}) => {
  const handleIngredients = (ingredients: string) => {
    onChange(ingredients);
  };

  return (
    <>
      <h1 className="self-start">Enter list of ingredients</h1>
      <div className="flex gap-6">
        <textarea
          onChange={(e) => handleIngredients(e.target.value)}
          value={ingredients}
          className="textarea textarea-bordered"
          placeholder="Rice, creme fraiche, broccoli..."
        ></textarea>
      </div>
    </>
  );
};

const StepCard = ({
  handleClick,
  text,
  isSelected,
}: {
  handleClick: () => void;
  text: string;
  isSelected: boolean;
}) => {
  return (
    <div className="card card-bordered" onClick={handleClick}>
      <div className="card-body">
        <div
          className={`card-title ${isSelected ? "font-bold" : "font-normal"}`}
        >
          <div>{text}</div>
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipeBody;
