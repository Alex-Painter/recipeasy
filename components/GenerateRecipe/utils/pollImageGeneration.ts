import { GENERATION_REQUEST_STATUS } from "@prisma/client";
import { GeneratedRecipe } from "../RecipeChat";
import api from "../../../lib/api";

const POLL_INTERVAL_SECONDS = 5;
const MAX_RETRIES = 10;

type RecipePollRequestBody = {
  generationRequestId: string;
  userId: string | null | undefined;
};

const pollImageGeneration = async (
  body: RecipePollRequestBody,
  onSuccess: (recipe: GeneratedRecipe) => void,
  onFailure: (failureMessage: string) => void
) => {
  let retries = 0;

  const poll = async () => {
    try {
      const response = await api.GET("recipe/generate/poll", body);

      if (!response.ok) {
        onFailure(response.statusText);
        return;
      }

      const responseBody = await response.json();

      /**
       * If the poll returns and the generation has failed
       */
      if (
        responseBody.message === GENERATION_REQUEST_STATUS.GENERATION_FAILED
      ) {
        onFailure("Generation failed");
        return;
      }

      /**
       * If polling finds generation completed, set returned recipe
       */
      if (
        responseBody.message === GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
      ) {
        const { recipe }: { recipe: GeneratedRecipe } = responseBody;
        onSuccess(recipe);
        return;
      }

      /**
       * If polling finds request is still in progress or yet to be picked up
       */
      if (
        (responseBody.message ==
          GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
          responseBody.message ===
            GENERATION_REQUEST_STATUS.GENERATION_REQUESTED) &&
        retries < MAX_RETRIES
      ) {
        retries++;
        setTimeout(poll, POLL_INTERVAL_SECONDS * 1000);
        return;
      }

      onFailure("Request timed out waiting for a response");
    } catch (e) {
      console.error("Error polling for generation status:", e);
    }
  };

  await poll();
};

export default pollImageGeneration;
