import prisma from "../lib/prisma";

const useRecipes = async () => {
  const allRecipes = await prisma.ingredient.findMany();

  const recipes = allRecipes.map((r) => {
    return {
      id: r.id,
      name: r.name,
    };
  });

  return recipes;
};

export default useRecipes;
