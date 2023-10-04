import { ISODateString, NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

interface EnrichedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
  expires: ISODateString;
}

const prisma = new PrismaClient();
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token }): Promise<EnrichedSession> {
      let enrichedSession: EnrichedSession = { ...session };
      if (token && enrichedSession.user) {
        enrichedSession.user.id = token.id as string;
        enrichedSession.user.name = token.name;
        enrichedSession.user.email = token.email;
        enrichedSession.user.image = token.picture;
      }

      return enrichedSession;
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
  },
  session: {
    strategy: "jwt",
  },
};
