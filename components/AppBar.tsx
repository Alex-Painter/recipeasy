"use client";

import React from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

import { User } from "next-auth";

const AppBar = ({ user }: { user: Omit<User, "id"> | undefined }) => {
  return (
    <div className="container mx-auto flex flex-row gap-4 pt-4 pb-4">
      <h1 className="flex h1 self-center">Recipeasy</h1>
      <div className="flex gap-2 w-full">
        <Link href="/">
          <button className="btn">Home</button>
        </Link>
        <Link href="/recipe/new">
          <button className="btn">Add recipe</button>
        </Link>
        <Link href="/ingredient/new">
          <button className="btn">Add ingredients</button>
        </Link>
        {!user && (
          <button className="ml-auto" onClick={() => signIn("google")}>
            Sign in
          </button>
        )}
        {user && (
          <button
            className="ml-auto"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out {user.name}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppBar;
