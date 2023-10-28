import React, { RefObject } from "react";

import { UNIT } from "@prisma/client";
import RecipeDetailsCard from "../RecipeDetailsCard";

type Ingredient = {
  recipeId: number;
  ingredientId: number;
  amount: number;
  unit: UNIT;
} & {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface RecipeModalProps {
  modalRef: RefObject<HTMLDialogElement>;
  title: string;
  ingredients: Ingredient[];
  instructions: PrismaJson.RecipeInstructions | null;
  username: string | null;
  avatarUrl: string | null;
  prompt: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  modalRef,
  title,
  ingredients,
  instructions,
  username,
  avatarUrl,
  prompt,
}) => {
  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-6xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <RecipeDetailsCard
          title={title}
          ingredients={ingredients}
          instructions={instructions}
          username={username}
          avatarUrl={avatarUrl}
          prompt={prompt}
        />
      </div>
      <form method="dialog" className="modal-backdrop cursor-default">
        <button />
      </form>
    </dialog>
  );
};

export default RecipeModal;
