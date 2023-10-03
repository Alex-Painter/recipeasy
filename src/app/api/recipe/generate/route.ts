import { NextRequest, NextResponse } from "next/server";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";

import prisma from "../../../../../lib/prisma";
import api from "../../../../../lib/api";
import { AmountType } from "@/app/RecipeList/recipes";

interface ChatResponse {
  name: string;
  ingredients: {
    name: string;
    amount: string;
    amountType: string;
    alternativeNames?: string[];
  }[];
}

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

// do ocr
// do completion
// do similar vector fetch
// return recipe name, ingredients

// if ingredients don't have an identical match, return the next relevant
export async function POST(req: NextRequest) {
  const { image } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Internal server error: no OpenAI API key" },
      { status: 500 }
    );
  }

  if (!image) {
    return NextResponse.json(
      { error: "Bad request: image missing" },
      { status: 400 }
    );
  }

  const response = await fetch(
    "https://r13l1xriw7.execute-api.eu-west-2.amazonaws.com/dev/hello-world-python",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
      }),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Internal server error: OCR failed" },
      { status: 500 }
    );
  }

  // this failed once, not sure why
  let responseJSON;
  try {
    responseJSON = await response.json();
  } catch (e) {
    console.log(`Couldn't convert OCR response to json: ${e}`);
    return NextResponse.json(
      { error: "Internal server error: OCR response parsing failed" },
      { status: 500 }
    );
  }

  const text = responseJSON.response.text;

  const openai = new OpenAI({
    apiKey,
  });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `${recipePrompt}: ${text}` }],
    model: "gpt-3.5-turbo",
    // model: "gpt-4",
  });

  const contentString = completion.choices[0].message.content;
  const recipeObject: ChatResponse = JSON.parse(contentString ?? "");

  const client = new ChromaClient();
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: apiKey,
  });

  const collection = await client.getCollection({
    name: "ingredients",
    embeddingFunction: embedder,
  });

  const promises = recipeObject.ingredients.map((ingredient) => {
    return collection
      .query({
        queryTexts: ingredient.name,
        nResults: 2,
      })
      .then((results) => {
        return {
          documents: results.documents[0],
          metadatas: results.metadatas[0],
          query: ingredient.name,
        };
      });
  });

  const responses = await Promise.all(promises);

  const enrichedIngredients: any = [];
  responses.forEach((response) => {
    const ingredient = recipeObject.ingredients.find((i) => {
      return i.name === response.query;
    });

    if (!ingredient) {
      console.log(`Didn't find ingredient with name: ${response.query}`);
      return;
    }

    const foundExactMatch =
      response.query.toLocaleLowerCase() ===
      response.documents[0]?.toLocaleLowerCase();

    const formattedDBIds = response.metadatas.map((idObj) => {
      if (!idObj) {
        return -1;
      }
      return idObj.postgresId;
    });

    enrichedIngredients.push({
      name: ingredient.name,
      amount: ingredient.amount,
      amountType:
        unitNames[ingredient.amountType.toLocaleLowerCase()] ?? "UNKNOWN",
      exactMatch: foundExactMatch,
      alternativeNames: response.documents,
      alternativeDbIds: formattedDBIds,
    });
  });

  recipeObject.ingredients = enrichedIngredients;
  return NextResponse.json({ ok: true, recipe: recipeObject });
}

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
