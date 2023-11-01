"use client";

import React, { useEffect, useRef, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import {
  GENERATION_REQUEST_STATUS,
  Ingredient,
  Recipe,
  RecipeIngredient,
} from "@prisma/client";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import Snackbar from "../UI/Snackbar";
import RecipeDetailsCard from "../RecipeDetailsCard";
import { Chat } from "../../hooks/useChat";

const POLL_INTERVAL_SECONDS = 5;
const MAX_RETRIES = 10;

export type GeneratedRecipe =
  | Recipe & {
      recipeIngredients: (RecipeIngredient & Ingredient)[];
    };

const RecipeChat = ({
  currentUser,
  chat,
}: {
  currentUser: EnrichedUser;
  chat: Chat;
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe>();
  const [isError, setIsError] = useState<string | undefined>();
  const hasFetched = useRef(false);

  const completedRequests = chat.filter(
    (chatObj) =>
      chatObj.request.status ===
        GENERATION_REQUEST_STATUS.GENERATION_COMPLETE && chatObj.recipe
  );
  const inProgressChat = chat.filter(
    (chatObj) =>
      chatObj.request.status ===
        GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
      chatObj.request.status === GENERATION_REQUEST_STATUS.GENERATION_REQUESTED
  )[0];

  useEffect(() => {
    const pollGenerationStatus = async () => {
      setIsPolling(true);
      hasFetched.current = true;

      let retries = 0;
      const poll = async () => {
        try {
          const response = await api.GET("recipe/generate/poll", {
            generationRequestId: inProgressChat.request.id,
            userId: currentUser.id,
          });

          if (!response.ok) {
            setIsError(response.statusText);
            return;
          }

          const responseBody = await response.json();

          /**
           * If the poll returns and the generation has failed
           */
          if (
            responseBody.message === GENERATION_REQUEST_STATUS.GENERATION_FAILED
          ) {
            setIsError("Generation failed");
            return;
          }

          /**
           * If polling finds generation completed, set returned recipe
           */
          if (
            responseBody.message ===
            GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
          ) {
            setGeneratedRecipe(responseBody.recipe);
            return;
          }

          /**
           * If polling finds request is still in progress or yet to be picked up
           */
          if (
            (responseBody.message ==
              GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
              responseBody.message ===
                GENERATION_REQUEST_STATUS.GENERATION_REQUESTED) &&
            retries < MAX_RETRIES
          ) {
            setTimeout(poll, POLL_INTERVAL_SECONDS * 1000);
            retries++;
            return;
          }

          console.log(responseBody);
          setIsError("Request timed out waiting for a response");
        } catch (e) {
          setIsPolling(false);
          console.error("Error polling for generation status:", e);
        }
      };

      await poll();
      setIsPolling(false);
    };

    if (
      inProgressChat &&
      (inProgressChat.request.status ===
        GENERATION_REQUEST_STATUS.GENERATION_REQUESTED ||
        (inProgressChat.request.status ===
          GENERATION_REQUEST_STATUS.GENERATION_PROGRESS &&
          !hasFetched.current))
    ) {
      pollGenerationStatus();
    }
  }, [inProgressChat, currentUser.id, isPolling]);

  return (
    <>
      <Snackbar
        status="success"
        text="Recipe created!"
        isOpen={!!generatedRecipe}
      />
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
        {inProgressChat && (
          <div
            key={inProgressChat.request.id}
            className="flex flex-col items-end"
          >
            <RecipeChatHeader
              promptText={inProgressChat.request.text}
              username={inProgressChat.request.author.name}
              userImgUrl={inProgressChat.request.author.image}
            />
            <div className="min-w-full min-h-full rounded-2xl border-2 p-8">
              <RecipeDetailsCard
                title={generatedRecipe?.name}
                ingredients={generatedRecipe?.recipeIngredients}
                instructions={generatedRecipe?.instructions}
                username={inProgressChat.request.author.name}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecipeChat;
