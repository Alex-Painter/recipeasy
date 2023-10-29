"use client";

import React, { useEffect, useRef, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import { AuthoredRequest } from "../../hooks/useGenerationRequests";
import { GENERATION_REQUEST_STATUS, Recipe } from "@prisma/client";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";

const POLL_INTERVAL_SECONDS = 5;
const MAX_RETRIES = 10;

const RecipeChat = ({
  request,
  currentUser,
}: {
  request: AuthoredRequest;
  currentUser: EnrichedUser;
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [isRequestGenerating, setIsRequestGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe>();
  const hasFetched = useRef(false);

  console.log(request.status);
  useEffect(() => {
    const pollGenerationStatus = async () => {
      setIsPolling(true);
      hasFetched.current = true;

      let retries = 0;
      const poll = async () => {
        console.log("polling");
        const response = await api.GET("recipe/generate/poll", {
          generationRequestId: request.id,
          userId: currentUser.id,
        });

        const responseBody = await response.json();
        if (
          responseBody.message ===
            (GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
              GENERATION_REQUEST_STATUS.GENERATION_REQUESTED) &&
          retries < MAX_RETRIES
        ) {
          console.log("still in progress");
          console.log("retries:");
          console.log(retries + 1);
          retries++;
          setTimeout(poll, POLL_INTERVAL_SECONDS * 1000);
        } else if (
          responseBody.message === GENERATION_REQUEST_STATUS.GENERATION_PROGRESS
        ) {
          console.log("reached maximum retries");
          console.log("retries");
          console.log(retries);
        } else if (
          responseBody.message === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
        ) {
          console.log("response successful?");
          console.log(responseBody);
          setGeneratedRecipe(responseBody.recipe);
        }
      };
      await poll();
      setIsPolling(false);
    };

    if (
      (request.status === GENERATION_REQUEST_STATUS.GENERATION_REQUESTED ||
        request.status === GENERATION_REQUEST_STATUS.GENERATION_PROGRESS) &&
      !hasFetched.current
    ) {
      // start polling
      pollGenerationStatus();
    }
  }, [request, currentUser.id, isPolling]);

  return (
    <div className="mt-8 mb-8">
      <div className="flex flex-col items-end">
        <RecipeChatHeader
          promptText={request.text}
          username={request.author.name}
          userImgUrl={request.author.image}
        />
        {generatedRecipe && generatedRecipe.name}
      </div>
    </div>
  );
};

export default RecipeChat;
