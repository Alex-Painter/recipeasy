import React from "react";
import Link from "next/link";

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
      </div>
    </div>
  );
};

export default AppBar;
