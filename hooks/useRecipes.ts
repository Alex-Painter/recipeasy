import prisma from "../lib/prisma";

import { Recipe, RecipeIngredient, User } from "@prisma/client";

export type UserRecipe = Recipe & { recipeIngredients: RecipeIngredient[] } & {
  author: User;
};

const anonymousUser = {
  id: "-1",
  name: "Anon",
  email: "example",
  emailVerified: null,
  image: null,
};

const useRecipes = async (): Promise<UserRecipe[]> => {
  const recipes = prisma.recipe
    .findMany({
      where: {
        deletedAt: {
          equals: null,
        },
      },
      include: {
        author: true,
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    .then((recipes) => {
      return recipes.map((recipe) => {
        if (!recipe.author) {
          const newRecipe = { ...recipe };
          newRecipe.author = anonymousUser;
          return newRecipe;
        }

        // should we check the validity of the json properties?
        return recipe;
      });
    }) as Promise<UserRecipe[]>;

  return recipes;
};

export default useRecipes;
