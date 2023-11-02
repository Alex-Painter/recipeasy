"use client";

import React, { useState } from "react";
import PromptInput from "./PromptInput";
import PromptHeaderText from "./PromptHeaderText";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";

type HomePromptProps = {
  user: EnrichedUser | undefined;
};

const HomePrompt: React.FC<HomePromptProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const onSubmitInput = async (text: string) => {
    setIsLoading(true);
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    const body = {
      text,
      type: GENERATION_REQUEST_TYPE.GENERATIVE,
    };

    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      // TODO show snackbar or warning message
      setIsLoading(false);
      return;
    }

    const { request } = await response.json();
    api.POST("recipe/generate", {
      generationRequestId: request.id,
      userId: user.id,
    });

    router.push(`generate/${request.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <PromptHeaderText />
      {/* <PromptHeader /> */}
      <PromptInput
        placeholder="prawns, chilli, lemon, creme fraiche"
        hint="Enter a list of ingredients or a recipe name"
        onSubmit={onSubmitInput}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HomePrompt;
