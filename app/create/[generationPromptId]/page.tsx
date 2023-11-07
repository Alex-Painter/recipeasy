import React from "react";
import RecipeChat from "../../../components/GenerateRecipe/RecipeChat";
import { getCurrentUser } from "../../../lib/session";
import useChat from "../../../hooks/useChat";

const PromptRecipes = async ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  const { generationPromptId } = params;
  const [chat, error] = await useChat(generationPromptId);
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto xl:max-w-[1280px]">
      {user && !error && chat && <RecipeChat currentUser={user} chat={chat} />}
      {error && <div>{error}</div>}
    </div>
  );
};

export default PromptRecipes;