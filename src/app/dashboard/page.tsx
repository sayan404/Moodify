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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

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

  const handleCloseModal = () => setShowAll(false);
  const handleShowMerge = () => setShowMerge(true);
  const handleCloseMerge = () => setShowMerge(false);

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
    <div className="min-h-screen bg-gray-50 p-8 flex">
      {/* Sidebar */}
      <div>
        <button
          className="fixed top-6 left-6 z-50 bg-white border rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Open sidebar"
        >
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-800"></span>
        </button>
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col h-full p-6 gap-4">
            <button
              className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg"
              onClick={() => { setSidebarOpen(false); setShowAll(false); }}
            >
              Create Playlist
            </button>
            <button
              className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg"
              onClick={() => { setSidebarOpen(false); handleShowAllPlaylists(); }}
            >
              Checkout All Playlists
            </button>
            <button
              className="text-left px-4 py-2 rounded hover:bg-gray-100 font-semibold text-lg"
              onClick={() => { setSidebarOpen(false); handleShowMerge(); }}
            >
              Merge Playlists
            </button>
          </div>
        </div>
        {/* Overlay for sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      <div className="max-w-4xl mx-auto flex-1">
        <h1 className="text-4xl font-bold mb-8">Your Mood-Based Playlist Generator</h1>
        {/* The old button is now in the sidebar */}
        {/* Modal for all playlists */}
        {showAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div
              className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-fadeInScale"
              style={{ animation: 'fadeInScale 0.3s forwards' }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
              {allPlaylists.length === 0 && <p>No playlists found.</p>}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
            <style jsx>{`
              @keyframes fadeInScale {
                0% { opacity: 0; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}
        {/* Modal for merging playlists (placeholder) */}
        {showMerge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div
              className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-fadeInScale"
              style={{ animation: 'fadeInScale 0.3s forwards' }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={handleCloseMerge}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">Merge Playlists</h2>
              <p className="text-gray-600">This feature will allow you to select and merge multiple playlists into one. (Coming soon!)</p>
            </div>
            <style jsx>{`
              @keyframes fadeInScale {
                0% { opacity: 0; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
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