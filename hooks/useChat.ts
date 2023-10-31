import {
  GENERATION_REQUEST_TYPE,
  GenerationRequest,
  Ingredient,
  Recipe,
  RecipeIngredient,
  User,
} from "@prisma/client";
import prisma from "../lib/prisma";

export type AuthoredRequest = GenerationRequest & { author: User };

export type RecipeWithIngredients =
  | Recipe & {
      recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[];
    };

// export type Chat = {
//   request: AuthoredRequest;
//   recipe: RecipeWithIngredients;
// };

const useChat = async (generationRequestId: string) => {
  const generationRequest = await prisma.generationRequest.findFirst({
    where: {
      id: generationRequestId,
    },
    include: {
      author: true,
    },
  });

  if (!generationRequest) {
    return null;
  }

  /**
   * Get all iterative requests that are children of the top-level generative request
   */
  const interativeRequests = await prisma.generationRequest.findMany({
    where: {
      requestType: GENERATION_REQUEST_TYPE.ITERATIVE,
      parentRequestId: generationRequestId,
    },
    include: {
      author: true,
    },
  });

  /**
   * Get all recipes & ingredients for all request IDs
   */
  const allRequests = [generationRequest, ...interativeRequests];
  const ids = [...allRequests.map((r) => r.id)];
  const recipes = await prisma.recipe.findMany({
    where: {
      promptId: {
        in: ids,
      },
    },
    include: {
      recipeIngredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  /**
   * Format recipe and ingredients correctly
   */
  const formattedRecipes = recipes.map((r) => {
    const newRecipe = { ...r };
    const ingredients = r.recipeIngredients.map((ingredient) => {
      const ing = {
        ...ingredient,
        ...ingredient.ingredient,
      };
      return ing;
    });
    newRecipe.recipeIngredients = ingredients;
    return newRecipe;
  });

  /**
   * Format response
   */
  const chat = allRequests
    .map((re) => {
      const requestRecipe = formattedRecipes.find(
        (rec) => rec.promptId === re.id
      );

      if (!requestRecipe) {
        throw Error(
          `[${re.id}] Failed to find queried recipe for generation ID`
        );
      }

      return {
        request: re,
        recipe: requestRecipe,
      };
    })
    .sort((a, b) => (a.recipe.updatedAt > b.recipe.updatedAt ? 1 : -1));

  return chat;
};

export default useChat;
