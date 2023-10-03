"use client";

import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const AppBar = () => {
  return (
    <div className="container mx-auto flex flex-row gap-4 pt-4 pb-4">
      <h1 className="flex h1 self-center">Recipeasy</h1>
      <div className="flex justify-items-right gap-2">
        <Link href="/">
          <button className="btn">Home</button>
        </Link>
        <Link href="/recipe/new">
          <button className="btn">Add recipe</button>
        </Link>
        <Link href="/ingredient/new">
          <button className="btn">Add ingredients</button>
        </Link>
        <button onClick={() => signIn("google")}>Sign in</button>
      </div>
    </div>
  );
};

export default AppBar;
