import { signIn } from "next-auth/react";
import React, { RefObject } from "react";

const SignInModal = ({
  modalRef,
  closeModal,
}: {
  modalRef: RefObject<HTMLDialogElement>;
  closeModal: () => void;
}) => {
  const onGoogleSignIn = async () => {
    const response = await signIn("google", { redirect: false });

    if (response && response.ok) {
      closeModal();
    }
  };
  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box ">
        <div className="flex justify-center">
          <h2 className="text-xl font-bold mt-4">Log in or sign up</h2>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="btn flex items-center justify-center px-4 py-2 rounded shadow"
            onClick={onGoogleSignIn}
          >
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
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button />
      </form>
    </dialog>
  );
};

export default SignInModal;
