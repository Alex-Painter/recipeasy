import { NextAuthOptions, Session, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import logger from "./logger";
import { CoinTransactionType } from "@prisma/client";

export interface EnrichedSession extends Session {
  user?: EnrichedUser;
}

export interface EnrichedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
  coinBalance?: number | null;
  newUser?: boolean;
}

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

      if (token && session.user) {
        console.log("token and user");
        const user = {
          ...session.user,
          id: token.id as string,
          name: token.name,
          email: token.email,
          image: token.picture,
          coinBalance: token.coinBalance as number,
          newUser: token.newUser as boolean,
        };
        return {
          ...session,
          user: user,
        };
      } else {
        console.log("no token or user");
        return enrichedSession;
      }
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
        include: {
          coins: true,
        },
      });

      if (!dbUser) {
        console.log("no db user");
        if (user) {
          console.log("no auth user");
          token.id = user?.id;
        }
        console.log("no db or auth user");
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        coinBalance: dbUser.coins?.balance,
        newUser: dbUser.newUser,
      };
    },
  },
  events: {
    async createUser({ user }) {
      const userCoinBalance = await prisma.coinBalance.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (userCoinBalance) {
        logger.log(
          "error",
          `[${user.id}] Found existing coin balance on createUser`
        );
        return;
      }

      let defaultBalance = parseInt(process.env.DEFAULT_COIN_BALANCE!, 10);
      if (!defaultBalance || Number.isNaN(defaultBalance)) {
        defaultBalance = 5;
      }

      const coinBalanceCreateResponse = await prisma.coinBalance.create({
        data: {
          userId: user.id,
          balance: defaultBalance,
        },
      });

      if (!coinBalanceCreateResponse) {
        logger.log(
          "error",
          `[${user.id}] Failed to create coin balance for new user`
        );
        return;
      }

      const transactionResponse = await prisma.coinTransaction.create({
        data: {
          amount: defaultBalance,
          transactionType: CoinTransactionType.SIGNUP,
          createdAt: new Date(),
          userId: user.id,
        },
      });

      if (!transactionResponse) {
        logger.log(
          "error",
          `[${user.id}] Failed to create signup coin transaction for new user`
        );
        return;
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};

export function auth(): Promise<EnrichedSession | null> {
  return getServerSession(authOptions);
}
