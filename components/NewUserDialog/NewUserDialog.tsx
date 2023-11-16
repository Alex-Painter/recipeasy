import { RefObject } from "react";
import Button from "../UI/Button";

const NewUserDialog = ({
  modalRef,
  onClose,
}: {
  modalRef: RefObject<HTMLDialogElement> | undefined;
  onClose: () => void;
}) => {
  if (!modalRef) {
    return <></>;
  }

  const buttonText = "Cool! Let's go!";
  const headlineText = "Hi. You've got coins.";
  const mainMessage = "Thanks for signing up to Omlete.";
  const mainMessage2 =
    "As a new user you get 5 free coins. Each initial recipe generation costs 1 coin, however you can request up to 10 changes per recipe for free. See more info in the FAQs.";
  return (
    <dialog className="modal" ref={modalRef} onClose={onClose}>
      <div className="modal-box ">
        <div className="flex ejustify-center">
          <h2 className="text-xl font-bold mt-4 grow text-center">
            {headlineText}
          </h2>
          <form method="dialog" onSubmit={onClose}>
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>
        <div className="prose mt-4">{mainMessage}</div>
        <div className="prose mt-4">{mainMessage2}</div>
        <div className="prose mt-4">
          Happy creating - <span className="font-bold">Alex</span>
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={onClose}>{buttonText}</Button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={onClose}>
        <button />
      </form>
    </dialog>
  );
};

export default NewUserDialog;
