"use client";

import React, { useEffect, useRef, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import {
  GENERATION_REQUEST_STATUS,
  GENERATION_REQUEST_TYPE,
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

export type GeneratedRecipe =
  | Recipe & {
      recipeIngredients: (ClientRecipeIngredient & Ingredient)[];
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    setRecipeChat(chat);
  }, [chat]);

  let completedRequests: Chat = [];
  let inProgressChat: ChatPair | undefined;

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
  }

  useEffect(() => {
    if (inProgressChat) {
      setIsLoading(true);
    }

    if (inProgressChat && !hasFetched.current) {
      hasFetched.current = true;

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
            setIsLoading(false);
            return;
          }

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
          setIsLoading(false);
        },
        /**
         * On error when polling recipe generation
         * @param errorText error message
         */
        (errorText: string) => {
          setIsError(errorText);
          setIsLoading(false);
        }
      );
    }
  }, [inProgressChat, currentUser.id, recipeChat]);

  /**
   *
   * @param prompt text from prompt input
   */
  const handleSubmitPrompt = async (
    prompt: string,
    inputValueSetter: (value: string) => void
  ) => {
    setIsLoading(true);

    const generativeRequestId = recipeChat?.[0].request.id;
    const body = {
      text: prompt,
      type: GENERATION_REQUEST_TYPE.ITERATIVE,
      parentId: generativeRequestId,
    };

    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      setIsError("Something went wrong creating generation request");
      setIsLoading(false);
      return;
    }

    const { request } = await response.json();
    const latestChat = recipeChat?.[chat.length - 1];

    if (!latestChat || !latestChat.recipe) {
      setIsError("Couldn't find a recipe to modify");
      setIsLoading(false);
      return;
    }

    const recipeGenerateResponse = await api.POST("recipe/iterate", {
      generationRequestId: request.id,
      recipe: latestChat.recipe,
    });

    if (!response.ok) {
      setIsError("Something went wrong generating recipe");
      setIsLoading(false);
      return;
    }

    const responseBody = await recipeGenerateResponse.json();
    const { generatedRecipe }: { generatedRecipe: GeneratedRecipe } =
      responseBody;

    if (!recipeChat) {
      setIsError("Couldn't find loaded chat for response");
      setIsLoading(false);
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
    setIsLoading(false);
  };

  const inProgressPromptText = inProgressChat && inProgressChat.request.text;
  console.log(inProgressPromptText);
  return (
    <>
      <Snackbar status="success" text="Recipe created!" isOpen={false} />
      <Snackbar status="error" text={isError ?? ""} isOpen={!!isError} />
      <div className="mt-8 mb-8 px-8">
        {completedRequests.map(({ request: req, recipe }) => {
          if (!recipe || !recipe.recipeIngredients) {
            return;
          }
          return (
            <div key={req.id} className="flex flex-col items-end">
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
        <PromptInput
          placeholder="Make this recipe vegan"
          onSubmit={handleSubmitPrompt}
          isLoading={isLoading}
          value={inProgressPromptText}
          showImageUpload={false}
        />
      </div>
    </>
  );
};

export default RecipeChat;
