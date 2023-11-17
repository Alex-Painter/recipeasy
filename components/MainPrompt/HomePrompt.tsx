"use client";

import React, { useRef, useState } from "react";
import PromptInput from "./PromptInput";
import PromptHeaderText from "./PromptHeaderText";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";
import SignInModal from "../LogInModal";

type HomePromptProps = {
  user: EnrichedUser | undefined;
};

const HomePrompt: React.FC<HomePromptProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptUrlParam, setPromptUrlParam] = useState<string | undefined>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSubmitInput = async (text: string) => {
    setIsLoading(true);
    if (!user || !user.id) {
      const params = new URLSearchParams(searchParams);
      params.set("prompt", text);
      setPromptUrlParam(params.toString());

      if (modalRef === null || modalRef.current === null) {
        return;
      }
      modalRef.current.showModal();
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
    router.push(`create/${request.id}`);
  };

  const closeModal = () => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }
    modalRef.current.close();
  };

  const callbackUrl = promptUrlParam ? `/?${promptUrlParam}` : promptUrlParam;
  return (
    <div className="container mx-auto flex flex-col items-center justify-center">
      <PromptHeaderText />
      {/* <PromptHeader /> */}
      <PromptInput
        placeholder="prawns, chilli, lemon, creme fraiche"
        hint="Enter a list of ingredients or a recipe name"
        onSubmit={onSubmitInput}
        isLoading={isLoading}
        showImageUpload={true}
      />
      <SignInModal
        modalRef={modalRef}
        closeModal={closeModal}
        callbackUrl={callbackUrl}
      />
    </div>
  );
};

export default HomePrompt;
