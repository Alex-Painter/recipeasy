import { GenerationRequest, User } from "@prisma/client";
import prisma from "../lib/prisma";

export type AuthoredRequest = GenerationRequest & { author: User };

const useGenerationRequests = async (
  generationRequestId: string
): Promise<AuthoredRequest | null> => {
  const generationRequest = await prisma.generationRequest.findFirst({
    where: {
      id: generationRequestId,
    },
    include: {
      author: true,
    },
  });

  return generationRequest;
};

export default useGenerationRequests;
