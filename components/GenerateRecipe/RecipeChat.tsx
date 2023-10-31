"use client";

import React, { useEffect, useRef, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import { AuthoredRequest } from "../../hooks/useGenerationRequests";
import {
  GENERATION_REQUEST_STATUS,
  GenerationRequest,
  Ingredient,
  Recipe,
  RecipeIngredient,
} from "@prisma/client";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import Snackbar from "../UI/Snackbar";
import RecipeDetailsCard from "../RecipeDetailsCard";
import { UserRecipe } from "../../hooks/useRecipes";

const POLL_INTERVAL_SECONDS = 5;
const MAX_RETRIES = 10;

export type GeneratedRecipe =
  | Recipe & {
      recipeIngredients: (RecipeIngredient & Ingredient)[];
    };

const RecipeChat = ({
  request,
  currentUser,
  chat,
}: {
  request: AuthoredRequest;
  currentUser: EnrichedUser;
  chat: any;
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe>();
  const [isError, setIsError] = useState<string | undefined>();
  const hasFetched = useRef(false);

  useEffect(() => {
    const pollGenerationStatus = async () => {
      setIsPolling(true);
      hasFetched.current = true;

      let retries = 0;
      const poll = async () => {
        try {
          const response = await api.GET("recipe/generate/poll", {
            generationRequestId: request.id,
            userId: currentUser.id,
          });

          if (!response.ok) {
            setIsError(response.statusText);
            return;
          }

          const responseBody = await response.json();
          if (
            responseBody.message ===
            GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
          ) {
            setGeneratedRecipe(responseBody.recipe);
          } else if (retries < MAX_RETRIES) {
            setTimeout(poll, POLL_INTERVAL_SECONDS * 1000);
            retries++;
          } else {
            setIsError("Request timed out waiting for a response");
          }
        } catch (e) {
          setIsPolling(false);
          console.error("Error polling for generation status:", e);
        }
      };

      await poll();
      setIsPolling(false);
    };

    if (
      (request.status === GENERATION_REQUEST_STATUS.GENERATION_REQUESTED ||
        request.status === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE ||
        request.status === GENERATION_REQUEST_STATUS.GENERATION_PROGRESS) &&
      !hasFetched.current
    ) {
      pollGenerationStatus();
    }
  }, [request, currentUser.id, isPolling]);

  // const isLoading = isPolling && !generatedRecipe && !isError;
  return (
    <>
      <Snackbar
        status="success"
        text="Recipe created!"
        isOpen={!!generatedRecipe}
      />
      <Snackbar status="error" text={isError ?? ""} isOpen={!!isError} />
      <div className="mt-8 mb-8 px-8">
        {chat.map(
          ({
            request: req,
            recipe,
          }: {
            request: AuthoredRequest;
            recipe: UserRecipe;
          }) => {
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
          }
        )}
      </div>
    </>
  );
};

export default RecipeChat;
