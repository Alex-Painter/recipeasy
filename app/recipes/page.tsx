import RecipeList from "../../components/RecipeList/RecipeList";
import useRecipes from "../../hooks/useRecipes";
import { getCurrentUser } from "../../lib/session";

export default async function Recipes() {
  const user = await getCurrentUser();
  const recipes = await useRecipes({ userId: user?.id });
  return (
    <div className="container mx-auto">
      <h1 className=" text-2xl mt-8">My recipes</h1>
      <div className="mt-4">{user && <RecipeList recipes={recipes} />}</div>
    </div>
  );
}
