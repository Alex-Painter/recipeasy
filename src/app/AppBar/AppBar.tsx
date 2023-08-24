import Link from "next/link";
import React from "react";

const AppBar = () => {
  return (
    <div className="">
      <div>App bar</div>
      <div>
        <Link href="recipe/new">
          <button className="btn">Add recipe</button>
        </Link>
      </div>
    </div>
  );
};

export default AppBar;
