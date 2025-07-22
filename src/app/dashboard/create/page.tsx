"use client";
import { useState } from "react";
import MoodInput from "../../../components/playlist/MoodInput";
import PlaylistDisplay from "../../../components/playlist/PlaylistDisplay";

export default function CreatePlaylistPage() {
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSubmit = async (data: { moodText: string; description: string; mood: string; numSongs: number }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/playlist/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist");
      }

      const resData = await response.json();
      setGeneratedPlaylist(resData.playlist);
    } catch (error) {
      console.error("Error generating playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] py-2">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Mood-Based Playlist Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-[10px] max-w-2xl mx-auto ">
            Let AI create the perfect playlist based on your current mood, whether you're feeling energetic, relaxed, or anything in between.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8">
          <MoodInput onSubmit={handleMoodSubmit} isLoading={isLoading} />
        </div>

        {generatedPlaylist && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 animate-fadeIn">
            <PlaylistDisplay playlist={generatedPlaylist} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 