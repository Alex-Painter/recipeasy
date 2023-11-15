"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import SignInModal from "./LogInModal";
import Link from "next/link";

interface AvatarProps {
  imageSrc: string | null | undefined;
  name?: string | null | undefined;
}

const Avatar = ({ imageSrc, name }: AvatarProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  let initial = "";
  if (name && !imageSrc) {
    initial = name[0].toLocaleUpperCase();
  }

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
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className={`btn btn-ghost btn-circle ${imageSrc ? "avatar" : ""}`}
          >
            <div className="w-10 rounded-full flex justify-center items-center">
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt="Image depicting the current user"
                  width={12}
                  height={12}
                />
              )}
              {!imageSrc && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {name && <li className="px-3 py-2 divide-y-2">{name}</li>}
            {name && (
              <li>
                <Link href="/recipes">My recipes</Link>
              </li>
            )}
            {name && (
              <li>
                <Link href="/coins">Buy coins</Link>
              </li>
            )}
            {name && (
              <li>
                <a>Settings</a>
              </li>
            )}
            {name && (
              <li>
                <a onClick={() => signOut({ callbackUrl: "/" })}>Log out</a>
              </li>
            )}
            {!name && (
              <li>
                <a onClick={onSignIn}>Log in</a>
              </li>
            )}
            {!name && (
              <li>
                <a onClick={onSignIn}>Sign up</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <SignInModal modalRef={modalRef} closeModal={closeModal} />
    </>
  );
};

export default Avatar;
