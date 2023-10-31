"use client";

import React, { useState } from "react";
import api from "../../lib/api";
import { EnrichedUser } from "../../lib/auth";
import { useRouter } from "next/navigation";

interface PromptInputProps {
  user: EnrichedUser | undefined;
}

const PromptInput: React.FC<PromptInputProps> = ({ user }) => {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string>(
    "prawns, chilli, lemon, creme fraiche"
  );
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitPrompt: React.FormEventHandler<HTMLFormElement> = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (!user || !user.id) {
      return;
    }

    const body = {
      text: ingredients,
      userId: user.id,
    };

    const response = await api.POST("generateRequest", body);
    if (!response.ok) {
      // show snackbar or warning message
      return;
    }

    const { requestId } = await response.json();
    api.POST("recipe/generate", {
      generationRequestId: requestId,
      userId: user.id,
    });
    router.push(`generate/${requestId}`);
  };

  const submitButtonFill = ingredients.length ? "#FFB951" : "#E1E1E1";
  const submitDisabled = !ingredients.length;
  return (
    <form onSubmit={onSubmitPrompt}>
      <div className="flex flex-col items-center p-6">
        <div className="w-[300px] md:w-[600px]">
          <div className="text-xs mb-1 ml-3">
            Create a new recipe from a list of ingredients, or, upload an image
            of your fridge!
          </div>
          <div className="flex items-center rounded-2xl border-2 pl-3 pr-1 py-1 h-12 shadow-lg border-orange-300 hover:scale-[1.025] focus-within:scale-[1.025] duration-150">
            <div className="tooltip" data-tip="Image upload coming soon!">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#E1E1E1"
                className="w-6 h-6 mr-4 ml-1"
              >
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path
                  fillRule="evenodd"
                  d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="prawns, chilli, lemon, creme fraiche"
              className="w-full h-full rounded-md mr-2 outline-none"
            />

            {!isLoading && (
              <button formMethod="submit" disabled={submitDisabled}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={submitButtonFill}
                  className="w-6 h-6 mr-2 hover:cursor-pointer"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            )}
            {isLoading && (
              <span className="loading loading-spinner text-warning mr-2"></span>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PromptInput;
