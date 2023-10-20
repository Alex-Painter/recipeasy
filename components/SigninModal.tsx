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
    const response = await signIn("google");

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
