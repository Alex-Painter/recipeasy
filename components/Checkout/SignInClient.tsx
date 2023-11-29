"use client";

import React, { useRef } from "react";
import SignInModal from "../Auth/LogInModal";
import Button from "../UI/Button";

const SignInClient = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const onSignIn = () => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }
    modalRef.current.showModal();
  };

  const closeModal = () => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }
    modalRef.current.close();
  };

  return (
    <>
      <Button onClick={onSignIn}>
        <span>Sign in to purchase coins</span>
      </Button>
      <SignInModal modalRef={modalRef} closeModal={closeModal} />
    </>
  );
};

export default SignInClient;
