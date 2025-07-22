"use client";

import { useState, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  duration: number;
  preview_url?: string; // Added preview_url property
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
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPreview = (trackId: string, previewUrl: string | null) => {
    if (!previewUrl) {
      setToast({ type: 'error', message: 'No preview available for this song' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    if (playingTrackId === trackId && audio) {
      audio.pause();
      setPlayingTrackId(null);
      setAudio(null);
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(previewUrl);
      newAudio.play();
      newAudio.onended = () => {
        setPlayingTrackId(null);
        setAudio(null);
      };
      setPlayingTrackId(trackId);
      setAudio(newAudio);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

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
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg text-white text-sm ${
          toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
      <>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{playlist.name}</h2>
            <p className="text-gray-500 mt-1">Based on mood: {playlist.mood}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveToSpotify}
              disabled={saving}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition-colors text-sm disabled:bg-gray-300 flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition-colors text-sm flex items-center"
              >
                Open in Spotify
              </a>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-6">{index + 1}.</span>
                <div>
                  <p className="text-gray-900">{track.name}</p>
                  <p className="text-sm text-gray-500">
                    {track.artists.join(", ")} • {track.albumName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-mono">
                  {formatDuration(track.duration)}
                </span>
                <button
                  className={`${
                    track.preview_url 
                      ? 'bg-gray-900 hover:bg-black' 
                      : 'bg-gray-300 cursor-not-allowed'
                  } text-white px-3 py-1 rounded transition-colors text-sm flex items-center gap-1`}
                  onClick={() => handlePlayPreview(track.id, track.preview_url)}
                  disabled={!track.preview_url}
                >
                  <span role="img" aria-label="Play">
                    {playingTrackId === track.id ? '⏸️' : '▶️'}
                  </span>
                  {playingTrackId === track.id ? 'Stop' : 'Play'}
                </button>
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
                  className="text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:border-red-300 transition-colors disabled:opacity-60 text-sm flex items-center gap-1"
                  disabled={trackDeleting === track.id}
                >
                  <span role="img" aria-label="Delete">🗑️</span>
                  {trackDeleting === track.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    </div>
  );
} 