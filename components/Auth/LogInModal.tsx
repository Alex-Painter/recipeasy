import React, { RefObject } from "react";

import { signIn } from "next-auth/react";
import Link from "next/link";
import Button from "../UI/Button";

const SignInModal = ({
  modalRef,
  closeModal,
  callbackUrl,
}: {
  modalRef: RefObject<HTMLDialogElement>;
  closeModal: () => void;
  callbackUrl?: string;
}) => {
  const onGoogleSignIn = async () => {
    const options: any = {};

    if (callbackUrl) {
      options.callbackUrl = callbackUrl;
    } else {
      options.redirect = false;
    }

    const response = await signIn("google", options);

    if (response && response.ok) {
      closeModal();
    }
  };

  const onNav = () => {
    closeModal();
  };

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box ">
        <div className="flex justify-center">
          <div className="flex justify-center text-center flex-col mt-4">
            <h2 className="text-xl font-bold">Log in or sign up</h2>
            <h3 className="text-md text-slate-600 mt-2">
              Get 15 coins when you sign up - it&apos;s free!
            </h3>
          </div>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={onGoogleSignIn}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" x2="12" y1="8" y2="8" />
              <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
              <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
            </svg>
            <span>Sign in with Google</span>
          </Button>
        </div>
        <div className="mt-8 text-xs text-slate-400 w-full text-center">
          By using this website you agree to our{" "}
          <span className="underline">
            <Link href="/terms" onClick={onNav}>
              terms and conditions
            </Link>
          </span>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
};

export default SignInModal;
