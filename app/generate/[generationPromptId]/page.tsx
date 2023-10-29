import React from "react";
import useGenerationRequests from "../../../hooks/useGenerationRequests";
import RecipeChat from "../../../components/GenerateRecipe/RecipeChat";
import { getCurrentUser } from "../../../lib/session";

const PromptRecipes = async ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  const { generationPromptId } = params;

  // we need to get child requests too (if any)
  const request = await useGenerationRequests(generationPromptId);
  const user = await getCurrentUser();

  console.log("render page");
  return (
    <div className="container mx-auto ">
      {request && user && <RecipeChat request={request} currentUser={user} />}
    </div>
  );
};

export default PromptRecipes;
