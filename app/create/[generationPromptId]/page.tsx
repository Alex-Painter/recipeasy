import React from "react";
import RecipeChat from "../../../components/GenerateRecipe/RecipeChat";
import { getCurrentUser } from "../../../lib/session";
import useChat from "../../../hooks/useChat";
import { Metadata, ResolvingMetadata } from "next";
import prisma from "../../../lib/prisma";
import { metadata } from "../../layout";

type PageProps = {
  params: { generationPromptId: string };
};

const PromptRecipes = async ({ params }: PageProps) => {
  const { generationPromptId } = params;
  const [chat, error] = await useChat(generationPromptId);
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto lg:max-w-[1024px]">
      {!error && chat && <RecipeChat currentUser={user} chat={chat} />}
      {error && <div>{error}</div>}
    </div>
  );
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.generationPromptId;

  const recipe = await prisma.recipe.findFirst({
    where: {
      promptId: id,
    },
    include: {
      image: true,
    },
  });

  if (!recipe || !recipe.image?.imageUrl) {
    return metadata;
  }

  // optionally access and extend (rather than replace) parent metadata
  const parentMetadata = await parent;
  const previousImages = parentMetadata.openGraph?.images || [];

  return {
    ...metadata,
    title: `${recipe?.name} | Omlete`,
    openGraph: {
      ...metadata.openGraph,
      images: [recipe.image.imageUrl, ...previousImages],
      title: `${recipe?.name} | Omlete`,
      url: `https://eatomlete.com/create/${id}`,
    },
  };
}

export default PromptRecipes;
