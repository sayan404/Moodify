"use client";
import { useEffect, useState } from "react";

export default function AllPlaylistsPage() {
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>
      {loading ? (
        <div>Loading...</div>
      ) : allPlaylists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
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
                <div className="flex gap-2 items-center">
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
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                  >
                    {expanded === pl.id ? "Hide Songs" : "Show Songs"}
                  </button>
                </div>
              </div>
              <div className="text-gray-600 text-sm">{pl.sentiment && `Mood: ${pl.sentiment}`}</div>
              <div className="text-gray-400 text-xs">Created: {new Date(pl.createdAt).toLocaleString()}</div>
              {expanded === pl.id && pl.tracks && pl.tracks.length > 0 && (
                <div className="mt-2 bg-gray-50 rounded p-3">
                  <div className="font-semibold mb-2">Songs:</div>
                  <ul className="space-y-1">
                    {pl.tracks.map((track: any, idx: number) => (
                      <li key={track.id} className="flex items-center justify-between">
                        <span>
                          {idx + 1}. {track.name} <span className="text-gray-500 text-xs">({track.artists?.join(', ')})</span>
                        </span>
                        <span className="text-gray-400 text-xs">{Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 