"use client";

import React from "react";
import { User } from "next-auth";
import Avatar from "./Avatar";
import Image from "next/image";
import Link from "next/link";

const AppBar = ({ user }: { user: Omit<User, "id"> | undefined }) => {
  return (
    <div className="navbar bg-base-100 sticky top-0 z-10 border-b-2 border-b-border-grey">
      <div className="flex-1">
        <Link href="/">
          <Image
            src="/logo-img.jpg"
            alt="Cartoon image of an AI-generated omlette"
            className="w-12 h-12 mr-4"
            width={1024}
            height={1024}
          />
        </Link>
        <div className="prose text-orange-400 text-sm">
          What will you create today?
        </div>
      </div>
      <Avatar imageSrc={user?.image} name={user?.name} />
    </div>
  );
};

export default AppBar;
