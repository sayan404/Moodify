"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import MoodInput from "../../components/playlist/MoodInput";
import PlaylistDisplay from "../../components/playlist/PlaylistDisplay";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleMoodSubmit = async (moodText: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/playlist/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moodText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist");
      }

      const data = await response.json();
      console.log("data from dashboard page", data);
      setGeneratedPlaylist(data.playlist);
    } catch (error) {
      console.error("Error generating playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Mood-Based Playlist Generator</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <MoodInput onSubmit={handleMoodSubmit} isLoading={isLoading} />
        </div>

        {generatedPlaylist && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PlaylistDisplay playlist={generatedPlaylist} />
          </div>
        )}
      </div>
    </div>
  );
} 