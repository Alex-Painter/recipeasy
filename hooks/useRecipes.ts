import prisma from "../lib/prisma";

import { Ingredient, Recipe, RecipeIngredient, User } from "@prisma/client";

export type UserRecipe =
  | Recipe & {
      recipeIngredients: (RecipeIngredient & Ingredient)[];
    } & {
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
    //.then((rs) => [rs[0]])
    .then((recipes) => {
      return recipes.map((recipe) => {
        const newRecipe = { ...recipe };

        const ingredients = recipe.recipeIngredients.map((ingredient) => {
          return {
            ...ingredient,
            ...ingredient.ingredient,
          };
        });
        newRecipe.recipeIngredients = ingredients;

        if (!recipe.author) {
          newRecipe.author = anonymousUser;
        }

        return newRecipe;
      });
    }) as Promise<UserRecipe[]>;

  return recipes;
};

export default useRecipes;
