"use client";

import React, { useEffect, useRef, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
  IMAGE_GENERATION_REQUEST_STATUS,
  ImageGenerationRequest,
  Ingredient,
  Recipe,
} from "@prisma/client";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import Snackbar from "../UI/Snackbar";
import RecipeDetailsCard from "../Recipe/RecipeDetailsCard";
import { AuthoredRequest, Chat, ChatPair } from "../../hooks/useChat";
import PromptInput from "../MainPrompt/PromptInput";
import { ClientRecipeIngredient } from "../../hooks/useRecipes";
import { useBalanceStore } from "../../hooks/useStores";

export type GeneratedRecipe =
  | Recipe & {
      recipeIngredients: (ClientRecipeIngredient & Ingredient)[];
    } & {
      image?: ImageGenerationRequest;
    };

const RecipeChat = ({
  currentUser,
  chat,
}: {
  currentUser?: EnrichedUser;
  chat: Chat;
}) => {
  const [recipeChat, setRecipeChat] = useState<Chat>();
  const [isError, setIsError] = useState<string | undefined>();
  const [isRecipeLoading, setIsRecipeLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const { balance, setBalance } = useBalanceStore((state) => state);
  const hasSubscribedRecipe = useRef(false);
  const hasSubscribedImage = useRef(false);

  useEffect(() => {
    setRecipeChat(chat);
  }, [chat]);

  let completedRequests: Chat = [];
  let chatRequested: ChatPair | undefined;
  let imageRequested: ImageGenerationRequest | undefined;

  if (recipeChat) {
    completedRequests = recipeChat.filter(
      (chatObj) =>
        chatObj.request.status ===
          GENERATION_REQUEST_STATUS.GENERATION_COMPLETE && chatObj.recipe
    );

    chatRequested = recipeChat.filter(
      (chatObj) =>
        chatObj.request.status ===
        GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    )[0];

    imageRequested = completedRequests.findLast(
      (chatObj) =>
        chatObj.recipe?.image?.status ===
        IMAGE_GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    )?.recipe?.image;
  }

  useEffect(() => {
    const onLoad = async () => {
      console.log(chatRequested);
      console.log(imageRequested);
      if (!recipeChat) {
        setIsRecipeLoading(false);
        return;
      }

      if (chatRequested) {
        setIsRecipeLoading(true);
      }

      if (imageRequested) {
        setIsImageLoading(true);
      }

      /**
       * Generate requested recipe
       */
      if (chatRequested && !hasSubscribedRecipe.current && currentUser) {
        hasSubscribedRecipe.current = true;

        const generateRecipeResponse = await api.POST("recipe/generate", {
          generationRequestId: chatRequested.request.id,
          userId: currentUser.id,
          createImageRequest: true,
        });

        if (!generateRecipeResponse.ok) {
          setIsError(
            `Recipe generation failed: ${generateRecipeResponse.statusText}`
          );

          if (balance) {
            setBalance(balance + 1);
          }
          return;
        }

        const response = await generateRecipeResponse.json();
        const { generatedRecipe: recipe } = response;

        const updatedChat: Chat = recipeChat.map((chatObj) => {
          if (chatObj.request.id === recipe.promptId) {
            const authoredRequest = {
              ...chatObj.request,
              status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
            };
            return {
              recipe,
              request: authoredRequest,
            };
          } else {
            return chatObj;
          }
        });

        setRecipeChat(updatedChat);
        setIsRecipeLoading(false);
      }

      /**
       * Generate requested image
       */
      if (imageRequested && !hasSubscribedImage.current) {
        hasSubscribedImage.current = true;

        const imageGenerationResponse = await api.POST("image/generate", {
          imageGenerationRequestId: imageRequested.id,
        });

        if (!imageGenerationResponse.ok) {
          setIsError(
            `Image generation failed: ${imageGenerationResponse.statusText}`
          );
          return;
        }

        const response = await imageGenerationResponse.json();
        const { image: imageRequest } = response;

        const updatedChat: Chat = recipeChat.map((chat) => {
          if (chat.recipe && chat.recipe.id === imageRequest.recipeId) {
            return {
              request: chat.request,
              recipe: {
                ...chat.recipe,
                image: imageRequest,
              },
            };
          } else {
            return chat;
          }
        });

        setRecipeChat(updatedChat);
        setIsImageLoading(false);
      }
    };

    onLoad();
  }, [
    chatRequested,
    recipeChat,
    imageRequested,
    currentUser,
    balance,
    setBalance,
  ]);

  /**
   *
   * @param prompt text from prompt input
   */
  const handleSubmitPrompt = async (
    prompt: string,
    inputValueSetter: (value: string) => void
  ) => {
    setIsRecipeLoading(true);

    const generativeRequestId = recipeChat?.[0].request.id;
    const body = {
      text: prompt,
      type: GENERATION_REQUEST_TYPE.ITERATIVE,
      parentId: generativeRequestId,
    };

    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      setIsError("Something went wrong creating generation request");
      setIsRecipeLoading(false);
      return;
    }

    const { request } = await response.json();
    const latestChat = recipeChat?.[chat.length - 1];

    if (!latestChat || !latestChat.recipe) {
      setIsError("Couldn't find a recipe to modify");
      setIsRecipeLoading(false);
      return;
    }

    const recipeGenerateResponse = await api.POST("recipe/iterate", {
      generationRequestId: request.id,
      recipe: latestChat.recipe,
    });

    if (!response.ok) {
      setIsError("Something went wrong generating recipe");
      setIsRecipeLoading(false);
      return;
    }

    const responseBody = await recipeGenerateResponse.json();
    const { generatedRecipe }: { generatedRecipe: GeneratedRecipe } =
      responseBody;

    if (!recipeChat) {
      setIsError("Couldn't find loaded chat for response");
      setIsRecipeLoading(false);
      return;
    }

    const authoredRequest: AuthoredRequest = {
      ...request,
      status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
      author: currentUser,
    };
    const updatedChat: Chat = [
      ...recipeChat,
      {
        request: authoredRequest,
        recipe: generatedRecipe,
      },
    ];

    inputValueSetter("");
    setRecipeChat(updatedChat);
    setIsRecipeLoading(false);
  };

  const topLevelImage = recipeChat && recipeChat[0]?.recipe?.image?.imageUrl;
  const inProgressPromptText = chatRequested && chatRequested.request.text;
  const authorIsLoggedInUser =
    recipeChat && recipeChat[0]?.request.author.id === currentUser?.id;
  return (
    <div className="flex flex-col gap-2 pt-8 pb-16">
      <Snackbar status="success" text="Recipe created!" isOpen={false} />
      <Snackbar status="error" text={isError ?? ""} isOpen={!!isError} />
      {completedRequests.map(({ request: req, recipe }) => {
        if (!recipe || !recipe.recipeIngredients) {
          return;
        }

        let imageUrl = "/wallpaper.png";
        if (recipe.image?.imageUrl) {
          imageUrl = recipe.image.imageUrl;
        } else if (topLevelImage) {
          imageUrl = topLevelImage;
        }

        return (
          <div key={req.id} className="flex flex-col items-end mb-8 gap-2">
            <RecipeChatHeader
              promptText={req.text}
              username={req.author.name}
              userImgUrl={req.author.image}
            />
            <div className="">
              <RecipeDetailsCard
                title={recipe.name}
                ingredients={recipe.recipeIngredients}
                instructions={recipe.instructions}
                imageUrl={imageUrl}
                imageLoading={isImageLoading}
              />
            </div>
          </div>
        );
      })}
      {authorIsLoggedInUser && (
        <PromptInput
          placeholder="Make this recipe vegan"
          onSubmit={handleSubmitPrompt}
          isLoading={isRecipeLoading}
          value={inProgressPromptText}
          showImageUpload={false}
        />
      )}
    </div>
  );
};

export default RecipeChat;
