"use client";

import React from "react";
import { User } from "next-auth";
import Avatar from "./Avatar";

const AppBar = ({ user }: { user: Omit<User, "id"> | undefined }) => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Omelette</a>
      </div>
      <Avatar imageSrc={user?.image} name={user?.name} />
    </div>
  );
};

export default AppBar;
