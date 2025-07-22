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

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error("Missing SPOTIFY_CLIENT_ID");
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing SPOTIFY_CLIENT_SECRET");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET");
}

// Add mock session for development
const mockSession = {
  user: {
    id: "mock_user_id",
    name: "Dev User",
    email: "dev@example.com",
    image: null,
  },
  accessToken: "mock_access_token",
  refreshToken: "mock_refresh_token",
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
};

export const options: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // In development, always allow sign in
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      if (!account || !profile) {
        return false;
      }
      // Upsert user in DB
      const prisma = new PrismaClient();
      await prisma.user.upsert({
        where: { id: account.providerAccountId },
        update: {
          email: user.email,
          name: user.name,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        },
        create: {
          id: account.providerAccountId,
          email: user.email ?? "",
          name: user.name ?? null,
          accessToken: account.access_token ?? "",
          refreshToken: account.refresh_token ?? "",
          spotifyId: account.providerAccountId,
        },
      });
      return true;
    },
    async jwt({ token, account, profile }) {
      // In development, return mock token
      if (process.env.NODE_ENV === 'development') {
        return {
          ...token,
          accessToken: mockSession.accessToken,
          refreshToken: mockSession.refreshToken,
          accessTokenExpires: Date.now() + 1000 * 60 * 60 * 24,
          sub: mockSession.user.id,
        };
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + (account.expires_in as number) * 1000;
      }

      // If token has not expired, return it
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // If token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
              ).toString("base64")}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: token.refreshToken,
            }),
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          return {
            ...token,
            accessToken: tokens.access_token,
            accessTokenExpires: Date.now() + (tokens.expires_in as number) * 1000,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      // In development, return mock session
      if (process.env.NODE_ENV === 'development') {
        return {
          ...session,
          ...mockSession,
        };
      }

      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        if (token.error) {
          session.error = token.error as string;
        }
      }
      // Add the Spotify user ID to the session
      console.log("session from session callback", session);
      console.log("token from session callback", token);

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}; 