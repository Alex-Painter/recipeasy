export const dynamic = "force-dynamic";

import { IMAGE_GENERATION_REQUEST_STATUS } from "@prisma/client";
import api from "../../../lib/api";

const POLL_INTERVAL_SECONDS = 5;
const MAX_RETRIES = 10;

type RecipePollRequestBody = {
  generationRequestId: string;
};

const pollImageGeneration = async (
  body: RecipePollRequestBody,
  onSuccess: (image: {}) => void,
  onFailure: (failureMessage: string) => void
) => {
  let retries = 0;

  const poll = async () => {
    try {
      const response = await api.GET("image/generate/poll", body);

      if (!response.ok) {
        onFailure(response.statusText);
        return;
      }

      const responseBody = await response.json();

      /**
       * If the poll returns and the generation has failed
       */
      if (
        responseBody.message ===
        IMAGE_GENERATION_REQUEST_STATUS.GENERATION_FAILED
      ) {
        onFailure("Generation failed");
        return;
      }

      /**
       * If polling finds generation completed, set returned recipe
       */
      if (
        responseBody.message ===
        IMAGE_GENERATION_REQUEST_STATUS.GENERATION_COMPLETE
      ) {
        const { image }: { image: {} } = responseBody;
        onSuccess(image);
        return;
      }

      /**
       * If polling finds request is still in progress or yet to be picked up
       */
      if (
        (responseBody.message ==
          IMAGE_GENERATION_REQUEST_STATUS.GENERATION_PROGRESS ||
          responseBody.message ===
            IMAGE_GENERATION_REQUEST_STATUS.GENERATION_REQUESTED) &&
        retries < MAX_RETRIES
      ) {
        retries++;
        setTimeout(poll, POLL_INTERVAL_SECONDS * 1000);
        return;
      }

      onFailure("Request timed out waiting for a response");
    } catch (e) {
      console.error("Error polling for image generation status:", e);
    }
  };

  await poll();
};

export default pollImageGeneration;
