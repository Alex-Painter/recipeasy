"use client";

import React, { useEffect, useState } from "react";
import RecipeChatHeader from "./RecipeChatHeader";
import { AuthoredRequest } from "../../hooks/useGenerationRequests";
import { GENERATION_REQUEST_STATUS } from "@prisma/client";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";

const RecipeChat = ({
  request,
  currentUser,
}: {
  request: AuthoredRequest;
  currentUser: EnrichedUser;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sendGenerate = async () => {
      setIsLoading(true);
      const response = await api.POST("recipe/generate", {
        generationRequestId: request.id,
        userId: currentUser.id,
      });
      setIsLoading(false);
    };

    if (request.status === GENERATION_REQUEST_STATUS.GENERATION_REQUESTED) {
      sendGenerate();
    }
  }, [request, currentUser.id]);

  return (
    <div className="mt-8 mb-8">
      <div className="flex flex-col items-end">
        <RecipeChatHeader
          promptText={request.text}
          username={request.author.name}
          userImgUrl={request.author.image}
        />
      </div>
    </div>
  );
};

export default RecipeChat;
