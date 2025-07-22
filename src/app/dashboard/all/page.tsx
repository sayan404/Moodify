"use client";
import { useEffect, useState } from "react";

export default function AllPlaylistsPage() {
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackDeleting, setTrackDeleting] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      setLoading(true);
      try {
        const res = await fetch("/api/playlist/save?mine=true");
        const data = await res.json();
        setAllPlaylists(data.playlists || []);
      } catch (e) {
        setAllPlaylists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  const handleDeleteTrack = async (playlistId: string, trackId: string) => {
    if (!window.confirm("Delete this song from playlist?")) return;
    setTrackDeleting(trackId);
    try {
      const res = await fetch("/api/playlist/save/track", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPlaylistId: playlistId, trackId }),
      });
      if (res.ok) {
        setAllPlaylists((prev) =>
          prev.map((pl) =>
            pl.id === playlistId
              ? { ...pl, tracks: pl.tracks.filter((t: any) => t.id !== trackId) }
              : pl
          )
        );
      }
    } finally {
      setTrackDeleting(null);
    }
  };

  const handlePlayPreview = (trackId: string, previewUrl: string | null) => {
    if (!previewUrl) {
      alert("No preview available for this song");
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white text-center">Your Playlists</h1>
      {loading ? (
        <div className="text-center text-lg text-gray-500 dark:text-gray-400">Loading...</div>
      ) : allPlaylists.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No playlists found.</p>
      ) : (
        <div className="space-y-6">
          {allPlaylists.map((pl) => (
            <div key={pl.id} className="border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 transition-all">
              <div className="flex justify-between items-center px-6 py-4">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{pl.name}</span>
                  {pl.user && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">by {pl.user.name || pl.user.email || pl.user.id}</span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {pl.spotifyPlaylistId && (
                    <a
                      href={`https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-900 transition-colors text-sm"
                    >
                      Open in Spotify
                    </a>
                  )}
                  <button
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all text-sm"
                    onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                  >
                    {expanded === pl.id ? "Hide Songs" : "Show Songs"}
                  </button>
                </div>
              </div>
              <div className="px-6 pb-2">
                <div className="text-gray-600 dark:text-gray-400 text-sm">{pl.sentiment && `Mood: ${pl.sentiment}`}</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs">Created: {new Date(pl.createdAt).toLocaleString()}</div>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded === pl.id && pl.tracks && pl.tracks.length > 0 ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                {expanded === pl.id && pl.tracks && pl.tracks.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                    <div className="font-medium mb-3 text-gray-900 dark:text-white">Songs</div>
                    <ul className="space-y-2">
                      {pl.tracks.map((track: any, idx: number) => (
                        <li key={track.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
                          <span className="flex items-center gap-2">
                            <span className="text-gray-400 dark:text-gray-500 w-6">{idx + 1}.</span>
                            <span className="text-gray-900 dark:text-white">{track.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">({track.artists?.join(', ')})</span>
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">
                              {Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                            </span>
                            <button
                              className={`ml-2 ${track.preview_url ? 'bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'} text-white px-2 py-1 rounded transition-colors text-sm`}
                              onClick={() => handlePlayPreview(track.id, track.preview_url)}
                              disabled={!track.preview_url}
                            >
                              <span role="img" aria-label="Play">
                                {playingTrackId === track.id ? '⏸️' : '▶️'}
                              </span>
                              {playingTrackId === track.id ? 'Stop' : 'Play'}
                            </button>
                            <button
                              className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-500/50 transition-colors disabled:opacity-60 text-sm"
                              disabled={trackDeleting === track.id}
                              onClick={() => handleDeleteTrack(pl.id, track.id)}
                            >
                              <span role="img" aria-label="Delete">🗑️</span>
                              {trackDeleting === track.id ? "Deleting..." : "Delete"}
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 