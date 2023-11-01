"use client";

import React from "react";
import PromptInput from "./PromptInput";
import PromptHeaderText from "./PromptHeaderText";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import { useRouter } from "next/navigation";

type HomePromptProps = {
  user: EnrichedUser | undefined;
};

const HomePrompt: React.FC<HomePromptProps> = ({ user }) => {
  const router = useRouter();

  const onSubmitInput = async (text: string) => {
    if (!user || !user.id) {
      return;
    }

    const body = {
      text,
      userId: user.id,
    };

    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      // show snackbar or warning message
      return;
    }

    const { requestId } = await response.json();
    api.POST("recipe/generate", {
      generationRequestId: requestId,
      userId: user.id,
    });

    router.push(`generate/${requestId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <PromptHeaderText />
      <PromptInput onSubmit={onSubmitInput} />
    </div>
  );
};

export default HomePrompt;
