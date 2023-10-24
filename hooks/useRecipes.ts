import prisma from "../lib/prisma";

import {
  GenerationPrompt,
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
      recipePrompt: Pick<GenerationPrompt, "text">[];
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
        recipePrompt: {
          select: {
            text: true,
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
