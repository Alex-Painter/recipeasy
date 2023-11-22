import { useEffect, useState } from "react";

const SNACKBAR_TIMEOUT_SECONDS = 8;

const Snackbar = ({
  status,
  text,
  isOpen,
  onClose,
  timeoutSeconds,
}: {
  status: string;
  text: string;
  isOpen: boolean;
  onClose?: () => void;
  timeoutSeconds?: number;
}) => {
  const [show, setShow] = useState<boolean>();

  const timeoutInSeconds = timeoutSeconds ?? SNACKBAR_TIMEOUT_SECONDS;
  useEffect(() => {
    setShow(isOpen);

    if (isOpen) {
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        setShow(false);
      }, timeoutInSeconds * 1000);
    }
  }, [isOpen, onClose, timeoutInSeconds]);

  if (!show) {
    return <></>;
  }

  return (
    <div className="toast toast-top toast-center z-10">
      <div className={`alert alert-${status}`}>
        <span className="text-white">{text}</span>
      </div>
    </div>
  );
};

export default Snackbar;
