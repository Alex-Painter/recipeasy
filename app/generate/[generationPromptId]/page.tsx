import React from "react";

const PromptRecipes = ({
  params,
}: {
  params: { generationPromptId: string };
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {params.generationPromptId}
    </div>
  );
};

export default PromptRecipes;
