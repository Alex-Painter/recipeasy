import prisma from "../lib/prisma";

import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
  GenerationRequest,
  ImageGenerationRequest,
  Ingredient,
  Recipe,
  RecipeIngredient,
  User,
} from "@prisma/client";

export type ClientRecipeIngredient = Omit<RecipeIngredient, "amount"> & {
  amount: number;
};

export type UserRecipe =
  | Recipe & {
      recipeIngredients: (ClientRecipeIngredient & Ingredient)[];
    } & {
      author: User;
    } & {
      prompt: GenerationRequest;
    } & {
      image?: ImageGenerationRequest;
    };

const anonymousUser = {
  id: "-1",
  name: "Anon",
  email: "example",
  emailVerified: null,
  image: null,
  newUser: false,
};

const useRecipes = async (args?: {
  userId?: string | null;
  limit?: number;
}): Promise<UserRecipe[]> => {
  const where: any = {
    deletedAt: {
      equals: null,
    },
    prompt: {
      requestType: GENERATION_REQUEST_TYPE.GENERATIVE,
    },
  };

  if (args && args.userId) {
    where.author = {
      id: args.userId,
    };
  }

  const limit = (args && args.limit) ?? undefined;
  const recipes = prisma.recipe
    .findMany({
      where,
      include: {
        author: true,
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
        prompt: true,
        image: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })
    //.then((rs) => [rs[0]])
    .then((recipes) => {
      return recipes.map((recipe) => {
        const ingredients = recipe.recipeIngredients.map((ingredient) => {
          return {
            ...ingredient,
            ...ingredient.ingredient,
            amount: parseFloat(ingredient.amount.toString()),
          };
        });

        const newRecipe = { ...(recipe as unknown as UserRecipe) };

        if (!recipe.author) {
          newRecipe.author = anonymousUser;
        }

        if (!recipe.prompt) {
          newRecipe.prompt = {
            id: "-1",
            requestType: "GENERATIVE",
            text: "no prompt",
            createdBy: "-1",
            createdAt: new Date(),
            updatedAt: new Date(),
            parentRequestId: null,
            status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
          };
        }

        newRecipe.recipeIngredients = ingredients;
        return newRecipe;
      });
    }) as Promise<UserRecipe[]>;

  return recipes;
};

export default useRecipes;
