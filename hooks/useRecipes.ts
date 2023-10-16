import prisma from "../lib/prisma";

import { Recipe, RecipeIngredient, User } from "@prisma/client";

export type UserRecipe =
  | Recipe & { recipeIngredients: RecipeIngredient[] } & {
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

        if (!recipe.author) {
          newRecipe.author = anonymousUser;
        }

        return newRecipe;
      });
    }) as Promise<UserRecipe[]>;

  return recipes;
};

export default useRecipes;
