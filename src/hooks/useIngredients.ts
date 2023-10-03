import prisma from "../../lib/prisma";

const useIngredients = async () => {
  const allIngredients = await prisma.ingredient.findMany();

  const ings = allIngredients.map((i) => {
    return {
      id: i.id,
      name: i.name,
    };
  });

  return ings;
};

export default useIngredients;
