import React, { useState } from "react";
import { getCurrentUser } from "../../lib/session";

const RecipeChat = async () => {
  const user = await getCurrentUser();
  return (
    <div className="container mx-auto">
      <h1 className=" text-2xl mt-8">Create recipe</h1>
    </div>
  );
};

export default RecipeChat;
