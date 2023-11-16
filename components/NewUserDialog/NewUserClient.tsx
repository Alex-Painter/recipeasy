"use client";

import { useEffect, useRef } from "react";
import { EnrichedUser } from "../../lib/auth";
import NewUserDialog from "./NewUserDialog";
import api from "../../lib/api";

const NewUserClient = ({ user }: { user: EnrichedUser | undefined }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const closeModal = () => {
    if (modalRef === null || modalRef.current === null) {
      return;
    }

    api.PUT("/user/dialog");
    modalRef.current.close();
  };

  useEffect(() => {
    if (modalRef && modalRef.current && user?.newUser) {
      modalRef.current.showModal();
    }
  }, [user]);

  if (!user) {
    return <></>;
  }

  return <NewUserDialog modalRef={modalRef} onClose={closeModal} />;
};

export default NewUserClient;
