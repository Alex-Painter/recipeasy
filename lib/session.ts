import { getServerSession } from "next-auth/next";
import { EnrichedUser, authOptions } from "./auth";

export async function getCurrentUser(): Promise<EnrichedUser | undefined> {
  const session = await getServerSession(authOptions);
  console.log(session);
  return session?.user;
}
