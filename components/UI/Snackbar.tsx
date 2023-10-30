import { useEffect, useState } from "react";

const SNACKBAR_TIMEOUT_SECONDS = 5;

const Snackbar = ({
  status,
  text,
  isOpen,
  onClose,
}: {
  status: string;
  text: string;
  isOpen: boolean;
  onClose?: () => void;
}) => {
  const [show, setShow] = useState<boolean>();

  useEffect(() => {
    setShow(isOpen);

    if (isOpen) {
      setTimeout(() => setShow(false), SNACKBAR_TIMEOUT_SECONDS * 1000);
    }
  }, [isOpen]);

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
