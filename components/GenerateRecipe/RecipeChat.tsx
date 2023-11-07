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
import RecipeDetailsCard from "../RecipeDetailsCard";
import { AuthoredRequest, Chat, ChatPair } from "../../hooks/useChat";
import PromptInput from "../MainPrompt/PromptInput";
import { ClientRecipeIngredient } from "../../hooks/useRecipes";
import pollRecipeGeneration from "./utils/pollRecipeGeneration";
import Image from "next/image";
import pollImageGeneration from "./utils/pollImageGeneration";

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
  currentUser: EnrichedUser;
  chat: Chat;
}) => {
  const [recipeChat, setRecipeChat] = useState<Chat>();
  const [isError, setIsError] = useState<string | undefined>();
  const [isRecipeLoading, setIsRecipeLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const hasSubscribedRecipe = useRef(false);
  const hasSubscribedImage = useRef(false);

  useEffect(() => {
    setRecipeChat(chat);
  }, [chat]);

  let completedRequests: Chat = [];
  let inProgressChat: ChatPair | undefined;
  let inProgressImageGeneration: ImageGenerationRequest | undefined;

  if (recipeChat) {
    completedRequests = recipeChat.filter(
      (chatObj) =>
        chatObj.request.status ===
          GENERATION_REQUEST_STATUS.GENERATION_COMPLETE && chatObj.recipe
    );

    inProgressChat = recipeChat.filter(
      (chatObj) =>
        chatObj.request.status ===
          GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
        chatObj.request.status ===
          GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    )[0];

    inProgressImageGeneration = completedRequests.findLast(
      (chatObj) =>
        chatObj.recipe?.image?.status ===
          IMAGE_GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
        chatObj.recipe?.image?.status ===
          IMAGE_GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
    )?.recipe?.image;
  }

  // console.log(completedRequests);
  // console.log(inProgressImageGeneration);
  useEffect(() => {
    if (inProgressChat) {
      setIsRecipeLoading(true);
    }

    if (inProgressImageGeneration) {
      setIsImageLoading(true);
    }

    /**
     * Poll recipe generation
     */
    if (inProgressChat && !hasSubscribedRecipe.current) {
      hasSubscribedRecipe.current = true;

      const pollBody = {
        generationRequestId: inProgressChat.request.id,
        userId: currentUser.id,
      };

      pollRecipeGeneration(
        pollBody,
        /**
         * On successful response from poll
         * @param recipe
         * @returns
         */
        (recipe: GeneratedRecipe) => {
          if (!recipeChat) {
            setIsRecipeLoading(false);
            return;
          }

          let request: AuthoredRequest | undefined = undefined;
          const updatedChat: Chat = recipeChat.map((chatObj) => {
            if (chatObj.request.id === recipe.promptId) {
              const authoredRequest = {
                ...chatObj.request,
                status: GENERATION_REQUEST_STATUS.GENERATION_COMPLETE,
              };
              request = authoredRequest;
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
        },
        /**
         * On error when polling recipe generation
         * @param errorText error message
         */
        (errorText: string) => {
          setIsError(errorText);
          setIsRecipeLoading(false);
        },
        true
      );
    }

    /**
     * Poll image generation
     */
    if (inProgressImageGeneration && !hasSubscribedImage.current) {
      hasSubscribedImage.current = true;

      const pollBody = {
        imageGenerationRequestId: inProgressImageGeneration.id,
      };

      pollImageGeneration(
        pollBody,
        /**
         * On successful response from poll
         * @param recipe
         * @returns
         */
        (imageRequest: ImageGenerationRequest) => {
          if (!recipeChat) {
            setIsRecipeLoading(false);
            return;
          }

          const updatedChat = recipeChat.map((chat) => {
            if (chat.recipe?.id === imageRequest.recipeId) {
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
        },
        /**
         * On error when polling recipe generation
         * @param errorText error message
         */
        (errorText: string) => {
          setIsError(errorText);
          setIsRecipeLoading(false);
        }
      );
    }
  }, [inProgressChat, currentUser.id, recipeChat, inProgressImageGeneration]);

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

  // const createImage = async () => {
  //   setIsImageLoading(true);
  //   const response = api.POST("image/generate", {
  //     imageGenerationRequestId: "cloo3htg20005n55vj354pw9f",
  //   });
  //   console.log(response);
  //   setIsImageLoading(false);
  // };

  const inProgressPromptText = inProgressChat && inProgressChat.request.text;
  return (
    <>
      <Snackbar status="success" text="Recipe created!" isOpen={false} />
      <Snackbar status="error" text={isError ?? ""} isOpen={!!isError} />
      <div className="mt-8 mb-8 px-8">
        {completedRequests.map(({ request: req, recipe }) => {
          if (!recipe || !recipe.recipeIngredients) {
            return;
          }
          const imageURL = recipe.image?.imageUrl ?? "/pasta.png";
          return (
            <div key={req.id} className="flex flex-col items-end">
              {!isImageLoading && (
                <Image
                  src={imageURL}
                  height={250}
                  width={250}
                  alt="AI-generated image of the recipe"
                />
              )}
              {isImageLoading && <div>Image loading</div>}
              <RecipeChatHeader
                promptText={req.text}
                username={req.author.name}
                userImgUrl={req.author.image}
              />
              <div className="min-w-full min-h-full rounded-2xl border-2 p-8">
                <RecipeDetailsCard
                  title={recipe.name}
                  ingredients={recipe.recipeIngredients}
                  instructions={recipe.instructions}
                  username={currentUser.name}
                />
              </div>
            </div>
          );
        })}
        {/* <button onClick={createImage} disabled={isImageLoading}>
          Create image
        </button> */}
        <PromptInput
          placeholder="Make this recipe vegan"
          onSubmit={handleSubmitPrompt}
          isLoading={isRecipeLoading}
          value={inProgressPromptText}
          showImageUpload={false}
        />
      </div>
    </>
  );
};

export default RecipeChat;
