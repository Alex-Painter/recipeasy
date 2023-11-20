import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
  GenerationRequest,
  ImageGenerationRequest,
  Ingredient,
  Recipe,
  User,
} from "@prisma/client";
import prisma from "../lib/prisma";
import logger from "../lib/logger";
import { ClientRecipeIngredient } from "./useRecipes";

export type AuthoredRequest = GenerationRequest & { author: User };
export type NamedRecipeIngredient = ClientRecipeIngredient &
  Pick<Ingredient, "name" | "id">;
type UserRecipeFlat = Omit<Recipe, "recipeIngredients"> & {
  recipeIngredients: NamedRecipeIngredient[];
} & {
  image?: ImageGenerationRequest;
};

export type ChatPair = {
  request: AuthoredRequest;
  recipe?: UserRecipeFlat;
};

export type Chat = ChatPair[];

export enum ChatError {
  "INVALID_REQUEST_TYPE",
  "OTHER",
}

const useChat = async (
  generationRequestId: string
): Promise<[chat: Chat | null, error: string | null]> => {
  try {
    const generationRequest = await prisma.generationRequest.findFirst({
      where: {
        id: generationRequestId,
      },
      include: {
        author: true,
      },
    });

    if (!generationRequest) {
      throw Error(`Failed to find request for generation ID`);
    }

    /**
     * For now, we can only load a chat via the generative request ID
     */
    if (generationRequest.requestType != GENERATION_REQUEST_TYPE.GENERATIVE) {
      throw Error("Invalid request type");
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
        image: true,
      },
    });

    /**
     * Format recipe and ingredients correctly
     */
    const formattedRecipes = recipes.map((r) => {
      const ingredients = r.recipeIngredients.map((ingredient) => {
        const numericAmount = parseFloat(ingredient.amount.toString());
        const ing: NamedRecipeIngredient = {
          name: ingredient.ingredient.name,
          recipeId: ingredient.recipeId,
          ingredientId: ingredient.ingredientId,
          id: ingredient.ingredientId,
          amount: numericAmount,
          unit: ingredient.unit,
          createdAt: ingredient.createdAt,
          updatedAt: ingredient.updatedAt,
          deletedAt: ingredient.deletedAt,
        };
        return ing;
      });

      const newRecipe = { ...r } as unknown as UserRecipeFlat;
      newRecipe.recipeIngredients = ingredients;
      return newRecipe;
    });

    /**
     * Format response
     */
    const chat = allRequests
      .map((re) => {
        if (re.status === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE) {
          const requestRecipe = formattedRecipes.find(
            (rec) => rec.promptId === re.id
          );

          if (!requestRecipe) {
            throw Error(`Failed to find queried recipe for generation ID`);
          }

          return {
            request: re,
            recipe: requestRecipe,
          };
        } else {
          return {
            request: re,
          };
        }
      })
      .sort((a, b) => (a.request.updatedAt > b.request.updatedAt ? -1 : 1));

    return [chat, null];
  } catch (e) {
    const message = `[${generationRequestId}] Failed to load chat for request ID: ${e}`;
    logger.log("error", message);
    return [null, message];
  }
};

export default useChat;
