"use client";
import { useEffect, useState } from "react";

export default function AllPlaylistsPage() {
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackDeleting, setTrackDeleting] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gradient bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Your Playlists</h1>
      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading...</div>
      ) : allPlaylists.length === 0 ? (
        <p className="text-center text-gray-500">No playlists found.</p>
      ) : (
        <div className="space-y-6">
          {allPlaylists.map((pl) => (
            <div key={pl.id} className="border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow pb-2 mb-2">
              <div className="flex justify-between items-center px-6 py-4">
                <div>
                  <span className="font-semibold text-lg">🎵 {pl.name}</span>
                  {pl.user && (
                    <span className="ml-2 text-gray-500 text-sm">by {pl.user.name || pl.user.email || pl.user.id}</span>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {pl.spotifyPlaylistId && (
                    <a
                      href={`https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-1 rounded-full hover:bg-green-700 transition-colors font-semibold shadow"
                    >
                      Open in Spotify
                    </a>
                  )}
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors font-semibold shadow"
                    onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                  >
                    {expanded === pl.id ? "Hide Songs" : "Show Songs"}
                  </button>
                </div>
              </div>
              <div className="px-6 pb-2">
                <div className="text-gray-600 text-sm">{pl.sentiment && `Mood: ${pl.sentiment}`}</div>
                <div className="text-gray-400 text-xs">Created: {new Date(pl.createdAt).toLocaleString()}</div>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded === pl.id && pl.tracks && pl.tracks.length > 0 ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                {expanded === pl.id && pl.tracks && pl.tracks.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg p-4 mt-2">
                    <div className="font-semibold mb-2 text-gray-700 flex items-center gap-2">🎶 Songs:</div>
                    <ul className="space-y-2">
                      {pl.tracks.map((track: any, idx: number) => (
                        <li key={track.id} className="flex items-center justify-between bg-white rounded shadow-sm px-3 py-2 hover:bg-gray-100 transition-colors">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🎵</span>
                            <span className="font-medium">{idx + 1}. {track.name}</span>
                            <span className="text-gray-500 text-xs">({track.artists?.join(', ')})</span>
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs font-mono">{Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</span>
                            <button
                              className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-1 text-sm shadow"
                              disabled={trackDeleting === track.id}
                              onClick={() => handleDeleteTrack(pl.id, track.id)}
                            >
                              <span role="img" aria-label="Delete">🗑️</span> {trackDeleting === track.id ? "Deleting..." : "Delete"}
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