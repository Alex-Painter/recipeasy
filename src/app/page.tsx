import prisma from "../../lib/prisma";
import AppBar from "./AppBar/AppBar";
import AppBody from "./AppBody";

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

  console.log(recipes.forEach((r) => console.log(r.recipeIngredients)));
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AppBar />
      <AppBody />
    </main>
  );
}
