"use client";

import React, { useRef, useState } from "react";
import PromptInput from "./PromptInput";
import PromptHeaderText from "./PromptHeaderText";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { GENERATION_REQUEST_TYPE } from "@prisma/client";
import SignInModal from "../Auth/LogInModal";
import { useBalanceStore } from "../../hooks/useStores";
import Link from "next/link";

type HomePromptProps = {
  user: EnrichedUser | undefined;
};

const HomePrompt: React.FC<HomePromptProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptUrlParam, setPromptUrlParam] = useState<string | undefined>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balance, setBalance } = useBalanceStore((state) => state);

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

    if (!balance) {
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

    // set on the front-end, but don't actually update the DB until successfull generation
    setBalance(balance - 1);
    router.push(`create/${request.id}`);
  };

  const closeModal = () => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }
    modalRef.current.close();
  };

  const shouldDisable = balance === 0;
  const getHint = () => {
    if (!user) {
      return "Enter the ingredients you want a recipe for";
    }

    if (shouldDisable) {
      return (
        <span className="underline">
          <Link href="/coins">
            Looks like you&apos;re out of coins! Recharge here to continue
            creating
          </Link>
        </span>
      );
    }

    return "Enter the ingredients you want a recipe for";
  };

  const callbackUrl = promptUrlParam ? `/?${promptUrlParam}` : promptUrlParam;
  return (
    <div className="container mx-auto flex flex-col items-center justify-center">
      <PromptHeaderText />
      {/* <PromptHeader /> */}
      <PromptInput
        placeholder="e.g. prawns, chilli, creme fraiche"
        hint={getHint()}
        onSubmit={onSubmitInput}
        isLoading={isLoading}
        showImageUpload={true}
        shouldDisable={shouldDisable}
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
