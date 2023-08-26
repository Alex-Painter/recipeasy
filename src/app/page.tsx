import prisma from "../../lib/prisma";
import AppBody from "./AppBody";
import { Recipe } from "./RecipeList/recipes";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <AppBody />
    </main>
  );
}
