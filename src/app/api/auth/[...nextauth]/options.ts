import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPOTIFY_SCOPES = [
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state"
].join(" ");

// Debug logging for environment variables
console.log('Auth Configuration:', {
  hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
  hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  scopes: SPOTIFY_SCOPES,
});

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error("Missing SPOTIFY_CLIENT_ID");
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing SPOTIFY_CLIENT_SECRET");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET");
}

export const options: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { 
          scope: SPOTIFY_SCOPES,
        },
      },
      userinfo: {
        async request({ tokens, client, provider }) {
          console.log('Attempting to fetch user info:', {
            hasAccessToken: !!tokens.access_token,
            tokenType: typeof tokens.access_token,
            timestamp: new Date().toISOString()
          });
          
          try {
            const response = await fetch('https://api.spotify.com/v1/me', {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json',
              },
            });

            console.log('Userinfo Response:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              timestamp: new Date().toISOString()
            });

            if (!response.ok) {
              const error = await response.json();
              console.error('Userinfo Error:', {
                status: response.status,
                error,
                timestamp: new Date().toISOString()
              });
              throw error;
            }

            const profile = await response.json();
            console.log('Profile fetched successfully:', {
              id: profile.id,
              email: profile.email,
              timestamp: new Date().toISOString()
            });
            
            return profile;
          } catch (error) {
            console.error('Userinfo Request Failed:', {
              error,
              timestamp: new Date().toISOString()
            });
            throw error;
          }
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback Started:', {
        userId: user?.id,
        email: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile,
        timestamp: new Date().toISOString()
      });

      if (!account || !profile) {
        console.error('SignIn Failed: Missing account or profile', {
          hasAccount: !!account,
          hasProfile: !!profile
        });
        return false;
      }

      try {
        // Upsert user in DB
        const prisma = new PrismaClient();
        const result = await prisma.user.upsert({
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
        console.log('User Upserted Successfully:', {
          userId: result.id,
          email: result.email,
          timestamp: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.error('Database Operation Failed:', {
          error,
          userId: account.providerAccountId,
          timestamp: new Date().toISOString()
        });
        return false;
      }
    },
    async jwt({ token, account }) {
      console.log('JWT Callback Started:', {
        hasToken: !!token,
        hasAccount: !!account,
        timestamp: new Date().toISOString()
      });

      if (account) {
        console.log('New Account Details:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresIn: account.expires_in,
          timestamp: new Date().toISOString()
        });

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + (account.expires_in as number) * 1000;
      }

      // If token has not expired, return it
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        console.log('Using Existing Token:', {
          expiresIn: Math.floor((token.accessTokenExpires - Date.now()) / 1000),
          timestamp: new Date().toISOString()
        });
        return token;
      }

      // If token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          console.log('Attempting Token Refresh:', {
            timestamp: new Date().toISOString()
          });

          const basic = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64');
          
          const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${basic}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: token.refreshToken,
            }),
          });

          const tokens = await response.json();

          if (!response.ok) {
            console.error('Token Refresh Failed:', {
              status: response.status,
              statusText: response.statusText,
              error: tokens,
              timestamp: new Date().toISOString()
            });
            throw tokens;
          }

          console.log('Token Refresh Successful:', {
            hasNewAccessToken: !!tokens.access_token,
            hasNewRefreshToken: !!tokens.refresh_token,
            expiresIn: tokens.expires_in,
            timestamp: new Date().toISOString()
          });

          return {
            ...token,
            accessToken: tokens.access_token,
            accessTokenExpires: Date.now() + (tokens.expires_in as number) * 1000,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          };
        } catch (error) {
          console.error("Token Refresh Error:", {
            error,
            clientIdExists: !!process.env.SPOTIFY_CLIENT_ID,
            clientSecretExists: !!process.env.SPOTIFY_CLIENT_SECRET,
            timestamp: new Date().toISOString()
          });
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error,
        userId: token.sub,
        timestamp: new Date().toISOString()
      });

      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        if (token.error) {
          session.error = token.error as string;
        }
      }

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true, // Enable debug messages from NextAuth
};
