export enum AmountType {
  Individual = "individual",
  Grams = "grams",
  Millilitres = "millilitres",
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  amountType: AmountType;
}

export interface Recipe {
  name: string;
  rid: number;
  isSelected: boolean;
  ingredients: Array<Ingredient>;
}

const r1: Recipe = {
  name: "Oven-baked Pesto Risotto",
  rid: 1,
  isSelected: true,
  ingredients: [
    {
      id: 1,
      name: "Baby plum tomatoes",
      amount: 125,
      amountType: AmountType.Grams,
    },
    {
      id: 2,
      name: "White onion",
      amount: 1,
      amountType: AmountType.Individual,
    },
    {
      id: 3,
      name: "Garlic clove",
      amount: 2,
      amountType: AmountType.Individual,
    },
    { id: 4, name: "Risotto rice", amount: 175, amountType: AmountType.Grams },
  ],
};

const r2: Recipe = {
  name: "Blue Cheese & Broccoli Risotto",
  rid: 2,
  isSelected: false,
  ingredients: [
    {
      id: 2,
      name: "White onion",
      amount: 1,
      amountType: AmountType.Individual,
    },
    {
      id: 3,
      name: "Garlic clove",
      amount: 1,
      amountType: AmountType.Individual,
    },
    { id: 4, name: "Risotto rice", amount: 175, amountType: AmountType.Grams },
    {
      id: 5,
      name: "Vegetable stock",
      amount: 500,
      amountType: AmountType.Millilitres,
    },
  ],
};

const r3: Recipe = {
  name: "Chermoula Broccoli on Harissa Lentils",
  rid: 3,
  isSelected: false,
  ingredients: [
    {
      id: 1,
      name: "Baby plum tomatoes",
      amount: 125,
      amountType: AmountType.Grams,
    },
    {
      id: 3,
      name: "Garlic clove",
      amount: 3,
      amountType: AmountType.Individual,
    },
    {
      id: 5,
      name: "Vegetable stock",
      amount: 500,
      amountType: AmountType.Millilitres,
    },
    {
      id: 6,
      name: "Balsamic glaze",
      amount: 12,
      amountType: AmountType.Millilitres,
    },
    {
      id: 7,
      name: "Lentils (carton)",
      amount: 1,
      amountType: AmountType.Individual,
    },
  ],
};

export const recipes = [r1, r2, r3];
