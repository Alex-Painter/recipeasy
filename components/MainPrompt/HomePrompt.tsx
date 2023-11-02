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

  // const generateRecipe = (generationRequestId: string) => {
  //   if (!user || !user.id) {
  //     return;
  //   }
  // };

  const onSubmitInput = async (text: string) => {
    setIsLoading(true);
    console.log("sending request");
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }

    const body = {
      text,
      type: GENERATION_REQUEST_TYPE.GENERATIVE,
    };

    console.log("sending request");
    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      // show snackbar or warning message
      setIsLoading(false);
      return;
    }

    console.log("submitting");

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
      {/* <PromptHeader /> */}
      <PromptInput onSubmit={onSubmitInput} isLoading={isLoading} />
    </div>
  );
};

export default HomePrompt;
