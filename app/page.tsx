import HomePrompt from "../components/MainPrompt/HomePrompt";
import RecipeList from "../components/RecipeList/RecipeList";
import useRecipes from "../hooks/useRecipes";

export default async function Home() {
  const recipes = await useRecipes();
  return (
    <div className="flex flex-col">
      <HomePrompt />
      <div className="mt-6">
        <RecipeList recipes={recipes} />
      </div>
    </div>
  );
}
