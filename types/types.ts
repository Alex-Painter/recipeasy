// https://stackoverflow.com/questions/57132428/augmentations-for-the-global-scope-can-only-be-directly-nested-in-external-modul
export {};

declare global {
  namespace PrismaJson {
    type RecipeInstructions = {
      instructions: string[];
    };
  }
}

// also need to update schema.prisma & recipe/new/route.ts
export enum Unit {
  INDIVIDUAL = "INDIVIDUAL",
  GRAMS = "GRAMS",
  MILLILITRES = "MILLILITRES",
  TABLESPOON = "TABLESPOON",
  TEASPOON = "TEASPOON",
  OUNCE = "OUNCE",
  CUP = "CUP",
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface RecipeIngredient extends Ingredient {
  amount: number;
  Unit: Unit;
  recipeId: number;
}

export interface Recipe {
  id: number;
  name: string;
  isSelected: boolean;
  ingredients: Array<RecipeIngredient>;
}
