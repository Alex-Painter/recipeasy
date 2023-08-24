import { AmountType } from "@/app/RecipeList/recipes";
import prisma from "../../lib/prisma";
import { AmountType as AmountTypeDB } from "@prisma/client";

const useIngredients = async () => {
  const allIngredients = await prisma.ingredient.findMany();

  const ings = allIngredients.map((i) => {
    let amountType;

    switch (i.amountType) {
      case AmountTypeDB.GRAMS:
        amountType = AmountType.GRAMS;
        break;
      case AmountTypeDB.MILLILITRES:
        amountType = AmountType.MILLILITRES;
        break;
      case AmountTypeDB.INDIVIDUAL:
      default:
        amountType = AmountType.INDIVIDUAL;
    }

    return {
      id: i.id,
      amountType: amountType,
      name: i.name,
    };
  });

  return ings;
};

export default useIngredients;
