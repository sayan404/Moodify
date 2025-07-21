"use client";

import { signIn } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sentiment-Aware Playlist Generator
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Create personalized playlists based on your mood using AI-powered sentiment analysis
        </p>
        <button
          onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-4 rounded-full hover:bg-[#1ed760] transition-colors"
        >
          <FaSpotify className="text-2xl" />
          <span>Login with Spotify</span>
        </button>
      </div>
    </div>
  );
} 