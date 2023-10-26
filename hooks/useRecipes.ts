import prisma from "../lib/prisma";

import {
  GenerationRequest,
  Ingredient,
  Recipe,
  RecipeIngredient,
  User,
} from "@prisma/client";

export type UserRecipe =
  | Recipe & {
      recipeIngredients: (RecipeIngredient & Ingredient)[];
    } & {
      author: User;
    } & {
      prompt: GenerationRequest;
    };

const anonymousUser = {
  id: "-1",
  name: "Anon",
  email: "example",
  emailVerified: null,
  image: null,
};

// export const insertData = async () => {
//   const prompt = "";

//   const allRecipes = prisma.recipe.findMany();

//   const response = await Promise.all(
//     (
//       await allRecipes
//     ).map((recipe) => {
//       return prisma.generationPrompt.create({
//         data: {
//           recipeId: recipe.id,
//           createdBy: "clnbjqp6j000gmn089g4j059b",
//           text: "prawns, lemon, parsely, italian, creme fraiche",
//         },
//       });
//     })
//   );
//   return response;
// };

const useRecipes = async (userId?: string | null): Promise<UserRecipe[]> => {
  const where: any = {
    deletedAt: {
      equals: null,
    },
  };

  if (userId) {
    where.author = {
      id: userId,
    };
  }

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

        if (!recipe.prompt) {
          newRecipe.prompt = {
            id: "-1",
            requestType: "GENERATIVE",
            text: "no prompt",
            createdBy: "-1",
            createdAt: new Date(),
          };
        }

        return newRecipe;
      });
    }) as Promise<UserRecipe[]>;

  return recipes;
};

export default useRecipes;
