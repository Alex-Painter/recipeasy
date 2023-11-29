import Link from "next/link";
import HomePrompt from "../components/MainPrompt/HomePrompt";
import RecipeList from "../components/RecipeList/RecipeList";
import useRecipes from "../hooks/useRecipes";
import { getCurrentUser } from "../lib/session";

export default async function Home() {
  const recipes = await useRecipes({ limit: 25 });
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col min-h-[55vh] justify-center">
        <HomePrompt user={user} />
      </div>
      <Link
        href="https://www.producthunt.com/posts/omlete?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-omlete"
        target="_blank"
        className=""
      >
        <img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=426902&theme=neutral"
          alt="Omlete - Leftover&#0032;ingredients&#0044;&#0032;unlimited&#0032;recipes | Product Hunt"
          style={{ width: "250px", height: "54px" }}
          width="250"
          height="54"
        />
      </Link>
      <div className="flex flex-col mt-6 items-center w-full">
        <div className="flex divider w-4/5 self-center opacity-50" />
        <RecipeList recipes={recipes} />
      </div>
    </div>
  );
}
