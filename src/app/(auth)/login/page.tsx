"use client";

import { signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import { Music4 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Music4 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to Moodify
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal AI-powered playlist generator. Create the perfect soundtrack for any moment.
        </p>
        <div className="mt-10">
          <button
            onClick={() => signIn("spotify", { callbackUrl: "/dashboard/create" })}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-[#1ed760] transition-transform hover:scale-105"
          >
            <FaSpotify className="text-2xl" />
            <span>Login with Spotify</span>
          </button>
        </div>
      </div>
    </div>
  );
}
