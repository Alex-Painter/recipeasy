import { NextRequest, NextResponse } from "next/server";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";

import prisma from "../../../../../lib/prisma";
import api from "../../../../../lib/api";

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
      { error: "Internal server error: ocr failed" },
      { status: 500 }
    );
  }

  const responseJSON = await response.json();
  const text = responseJSON.response.text;

  const openai = new OpenAI({
    apiKey,
  });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `${recipePrompt}: ${text}` }],
    model: "gpt-3.5-turbo",
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
        return { results: results.documents, query: ingredient.name };
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

    enrichedIngredients.push({
      name: ingredient.name,
      amount: ingredient.amount,
      amountType: ingredient.amountType,
      alternativeNames: response.results,
    });
  });

  recipeObject.ingredients = enrichedIngredients;
  console.log(recipeObject);

  return NextResponse.json({ ok: true, recipe: recipeObject });
}
