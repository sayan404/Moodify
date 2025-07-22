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
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleShowAllPlaylists = async () => {
    if (!showAll) {
      try {
        const res = await fetch("/api/playlist/save?mine=true");
        const data = await res.json();
        setAllPlaylists(data.playlists || []);
      } catch (e) {
        setAllPlaylists([]);
      }
    }
    setShowAll((prev) => !prev);
  };

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
        <button
          className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          onClick={handleShowAllPlaylists}
        >
          {showAll ? "Hide All Playlists" : "Checkout All Playlists"}
        </button>
        {showAll && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">All Playlists</h2>
            {allPlaylists.length === 0 && <p>No playlists found.</p>}
            <div className="space-y-4">
              {allPlaylists.map((pl) => (
                <div key={pl.id} className="border-b pb-2 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{pl.name}</span>
                      {pl.user && (
                        <span className="ml-2 text-gray-500 text-sm">by {pl.user.name || pl.user.email || pl.user.id}</span>
                      )}
                    </div>
                    {pl.spotifyPlaylistId && (
                      <a
                        href={`https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 text-white px-4 py-1 rounded-full hover:bg-green-700 transition-colors"
                      >
                        Open in Spotify
                      </a>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm">{pl.sentiment && `Mood: ${pl.sentiment}`}</div>
                  <div className="text-gray-400 text-xs">Created: {new Date(pl.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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