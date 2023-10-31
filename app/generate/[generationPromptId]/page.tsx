import React from "react";
import useGenerationRequests from "../../../hooks/useGenerationRequests";
import RecipeChat from "../../../components/GenerateRecipe/RecipeChat";
import { getCurrentUser } from "../../../lib/session";
import useChat from "../../../hooks/useChat";

const PromptRecipes = async ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  const { generationPromptId } = params;

  const request = await useGenerationRequests(generationPromptId);
  const chat = await useChat(generationPromptId);
  const user = await getCurrentUser();
  console.log(chat);

  return (
    <div className="container mx-auto xl:max-w-[1280px]">
      {request && user && (
        <RecipeChat request={request} currentUser={user} chat={chat} />
      )}
    </div>
  );
};

export default PromptRecipes;
