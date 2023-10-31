import HomePrompt from "../components/MainPrompt/HomePrompt";
import RecipeList from "../components/RecipeList/RecipeList";
import useRecipes from "../hooks/useRecipes";

export default async function Home() {
  const recipes = await useRecipes({ limit: 25 });
  return (
    <div className="flex flex-col">
      <div className="flex flex-col min-h-[55vh] justify-center">
        <HomePrompt />
      </div>
      <div className="flex flex-col mt-6 items-center">
        <div className="flex divider w-4/5 self-center opacity-50" />
        <RecipeList recipes={recipes} />
      </div>
    </div>
  );
}
