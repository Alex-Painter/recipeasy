export enum AmountType {
  INDIVIDUAL = "INDIVIDUAL",
  GRAMS = "GRAMS",
  MILLILITRES = "MILLILITRES",
  TABLESPOON = "TABLESPOON",
  TEASPOON = "TEASPOON",
}

export interface Ingredient {
  id: number;
  name: string;
  amountType: AmountType;
}

export interface RecipeIngredient extends Ingredient {
  amount: number;
  recipeId: number;
}

export interface Recipe {
  id: number;
  name: string;
  isSelected: boolean;
  ingredients: Array<RecipeIngredient>;
}
