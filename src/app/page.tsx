import prisma from "../../lib/prisma";
import AppBody from "./AppBody";
import { Recipe } from "./RecipeList/recipes";

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    include: {
      recipeIngredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  const hydratedRecipes = recipes.reduce((agg: Recipe[], r) => {
    const hr: any = { ...r, isSelected: false }; // fix 'any' type
    const ingredients = r.recipeIngredients.map((i) => {
      return {
        id: i.ingredientId,
        name: i.ingredient.name,
        amount: i.amount,
        amountType: i.ingredient.amountType,
      };
    });

    hr.ingredients = ingredients;
    delete hr.recipeIngredients;
    agg.push(hr);

    return agg;
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AppBody initialRecipes={hydratedRecipes} />
    </main>
  );
}
