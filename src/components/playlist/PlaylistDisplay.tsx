"use client";

import { useState } from "react";

interface Track {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  duration: number;
}

interface Playlist {
  id: string;
  dbPlaylistId: string;
  name: string;
  tracks: Track[];
  mood: string;
  url?: string; // Added url property
}

interface PlaylistDisplayProps {
  playlist: Playlist;
}

export default function PlaylistDisplay({ playlist }: PlaylistDisplayProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [trackDeleting, setTrackDeleting] = useState<string | null>(null);
  const [tracks, setTracks] = useState(playlist.tracks);
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  console.log("playlist from playlist display", playlist);

  const handleSaveToSpotify = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/playlist/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId: playlist.id, dbPlaylistId: playlist.dbPlaylistId, tracks: playlist.tracks }),
      });

      if (!response.ok) {
        throw new Error("Failed to save playlist");
      }
      setSaved(true);
      setToast({ type: 'success', message: 'Playlist saved to Spotify!' });
    } catch (error) {
      console.error("Error saving playlist:", error);
      setToast({ type: 'error', message: 'Failed to save playlist.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{playlist.name}</h2>
            <p className="text-gray-600">Based on mood: {playlist.mood}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveToSpotify}
              className="bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-[#1ed760] transition-colors flex items-center gap-2"
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {saved ? "Saved" : saving ? "Saving..." : "Save"}
            </button>
            {playlist.url && saved && (
              <a
                href={playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors flex items-center"
              >
                Open in Spotify
              </a>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
            >
              <span className="w-8 text-gray-400">{index + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{track.name}</p>
                <p className="text-sm text-gray-600">
                  {track.artists.join(", ")} • {track.albumName}
                </p>
              </div>
              <span className="text-gray-500 text-sm">
                {formatDuration(track.duration)}
              </span>
              <button
                onClick={async () => {
                  if (!window.confirm(`Delete song "${track.name}" from playlist?`)) return;
                  setTrackDeleting(track.id);
                  try {
                    const res = await fetch("/api/playlist/save/track", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ dbPlaylistId: playlist.dbPlaylistId, trackId: track.id }),
                    });
                    if (res.ok) {
                      setTracks((prev) => prev.filter((t) => t.id !== track.id));
                    }
                  } finally {
                    setTrackDeleting(null);
                  }
                }}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-60"
                disabled={trackDeleting === track.id}
              >
                {trackDeleting === track.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </>
    </div>
  );
} 