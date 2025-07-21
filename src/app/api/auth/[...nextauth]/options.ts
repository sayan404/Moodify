import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPOTIFY_SCOPES = [
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
].join(" ");

export const options: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in attempt:', {
        email: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      });
      return true;
    },
    async jwt({ token, account }) {
      console.log('JWT callback:', {
        email: token.email,
        timestamp: new Date().toISOString(),
      });

      if (account) {
        console.log('Updating token with account info:', {
          accessToken: account.access_token ? 'Present' : 'Missing',
          refreshToken: account.refresh_token ? 'Present' : 'Missing',
          expiresAt: account.expires_at,
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', {
        email: session.user?.email,
        timestamp: new Date().toISOString(),
      });

      return {
        ...session,
        accessToken: token.accessToken,
      };
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', {
        url,
        baseUrl,
        timestamp: new Date().toISOString(),
      });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', {
        email: message.user.email,
        timestamp: new Date().toISOString(),
      });
    },
    async signOut(message) {
      console.log('User signed out:', {
        email: message.token.email,
        timestamp: new Date().toISOString(),
      });
    },
    async createUser(message) {
      console.log('New user created:', {
        email: message.user.email,
        timestamp: new Date().toISOString(),
      });
    },
    async linkAccount(message) {
      console.log('Account linked:', {
        provider: message.account.provider,
        timestamp: new Date().toISOString(),
      });
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
}; 