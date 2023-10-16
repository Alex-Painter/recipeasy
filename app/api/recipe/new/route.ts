import { NextRequest, NextResponse } from "next/server";
import { UNIT } from "@prisma/client";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

import prisma from "../../../../lib/prisma";
import { ChatResponse } from "../../../recipe/new/NewRecipe";
import { getCurrentUser } from "../../../../lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in", status: 403 });
  }

  if (!body) {
    console.log(req);
    return NextResponse.json({ error: "Invalid request body", status: 400 });
  }

  const draftRecipe: ChatResponse = body.draftRecipe;
  if (!draftRecipe) {
    console.log(body);
    return NextResponse.json({
      error: "Invalid request - no draft recipe found",
      status: 400,
    });
  }

  // create recipe
  const recipeResponse = await prisma.recipe.create({
    data: { name: draftRecipe.name, createdBy: user.id },
  });

  if (!recipeResponse) {
    return NextResponse.json({
      error: "Failed to save recipe",
      status: 500,
    });
  }

  const allIngredients = draftRecipe.ingredients.map((ing) => ing.name);
  const dbIngredients = await prisma.ingredient.findMany({
    where: {
      name: {
        in: allIngredients,
      },
    },
  });

  // find new ingredients that need to be created
  const ingsToInsert = draftRecipe.ingredients.reduce(
    (agg: { name: string }[], ingredient) => {
      if (!dbIngredients.find((ing) => ing.name === ingredient.name)) {
        const i = {
          name: ingredient.name,
        };
        agg.push(i);
        return agg;
      }
      return agg;
    },
    []
  );

  // we don't get the created records back: https://github.com/prisma/prisma/issues/8131
  await prisma.ingredient.createMany({
    data: ingsToInsert,
  });

  // might as well get all ingredient IDs
  const newIngredients = await prisma.ingredient
    .findMany({
      where: { name: { in: allIngredients } },
    })
    .then((arr) =>
      arr.reduce((agg: { [name: string]: number }, ing) => {
        agg[ing.name] = ing.id;
        return agg;
      }, {})
    );

  // format ingredients
  const ingredientsToInsert = draftRecipe.ingredients.map((ingredient) => {
    // TODO - support floats
    const parsedAmount = parseInt(ingredient.amount, 10);
    return {
      recipeId: recipeResponse.id,
      ingredientId: newIngredients[ingredient.name],
      unit: getDBEnum(ingredient.Unit.toLocaleUpperCase()),
      amount: parsedAmount,
    };
  });

  const recipeIngredientResponse = await prisma.recipeIngredient.createMany({
    data: ingredientsToInsert,
  });

  // add ingredients to vector DB
  const client = new ChromaClient();
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ status: 500 });
  }

  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: API_KEY,
  });

  if (ingsToInsert.length) {
    const collection = await client.getCollection({
      name: "ingredients",
      embeddingFunction: embedder,
    });

    const newIngNames = ingsToInsert.map((ing) => ing.name);
    const metadatas = newIngNames.map((name) => ({
      postgresId: newIngredients[name],
    }));
    const addResponse = await collection.add({
      ids: newIngNames,
      documents: newIngNames,
      metadatas,
    });

    if (addResponse.error) {
      console.log(addResponse.error);
      return NextResponse.json({ status: 500 });
    }
  }

  let ok = false;
  if (recipeIngredientResponse.count === draftRecipe.ingredients.length) {
    ok = true;
  }

  return NextResponse.json({ ok });
}

// TODO do this better
const getDBEnum = (unit: string) => {
  switch (unit) {
    case "GRAMS":
      return UNIT.GRAMS;
    case "MILLILITRES":
      return UNIT.MILLILITRES;
    case "TABLESPOON":
      return UNIT.TABLESPOON;
    case "TEASPOON":
      return UNIT.TEASPOON;
    case "OUNCE":
      return UNIT.OUNCE;
    case "CUP":
      return UNIT.CUP;
    case "INDIVIDUAL":
      return UNIT.INDIVIDUAL;
    default:
      return UNIT.INDIVIDUAL;
  }
};
