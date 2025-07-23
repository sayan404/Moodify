"use client";
import { useEffect, useState } from "react";
import { ExternalLink, ChevronDown, Loader2, Music, Pause, Play, Trash2 } from "lucide-react";
import SpotifyPlayer from "../../../components/playlist/SpotifyPlayer";

interface Track {
  id: string;
  name: string;
  artists: string[];
  duration: number;
  spotifyId: string;  // Make sure we have this
}

interface Playlist {
  id: string;
  name: string;
  sentiment?: string;
  tracks: Track[];
  spotifyPlaylistId?: string;
  createdAt: string;
}

export default function AllPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<{id: string; playlistId: string} | null>(null);

  useEffect(() => {
    // console.log('[AllPlaylistsPage] Fetching playlists...');
    async function fetchPlaylists() {
      setLoading(true);
      try {
        const res = await fetch("/api/playlist/save?mine=true");
        const data = await res.json();
        // console.log('[AllPlaylistsPage] Fetched playlists:', data.playlists);
        setPlaylists(data.playlists || []);
      } catch (e) {
        console.error('[AllPlaylistsPage] Error fetching playlists:', e);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  const handlePlayTrack = (track: Track, playlistId: string) => {
    // console.log('[AllPlaylistsPage] Play/Pause track:', {
    //   track: track.name,
    //   currentlyPlaying: selectedTrack?.id === track.id,
    //   spotifyId: track.spotifyId,
    //   playlistId
    // });

    if (selectedTrack?.id === track.id && selectedTrack?.playlistId === playlistId) {
      setSelectedTrack(null);
    } else {
      setSelectedTrack({ id: track.id, playlistId });
    }
  };

  const handleDeleteTrack = async (playlistId: string, trackId: string) => {
    // console.log('[AllPlaylistsPage] Deleting track:', { playlistId, trackId });
    
    if (selectedTrack?.playlistId === playlistId) {
      setSelectedTrack(null);
    }

    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
      )
    );

    try {
      const response = await fetch("/api/playlist/save/track", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPlaylistId: playlistId, trackId }),
      });
      // console.log('[AllPlaylistsPage] Delete track response:', response.status);
    } catch (error) {
      console.error('[AllPlaylistsPage] Error deleting track:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!window.confirm("Are you sure you want to delete this entire playlist? This cannot be undone.")) return;
    // console.log('[AllPlaylistsPage] Deleting playlist:', playlistId);
    
    if (selectedTrack?.playlistId === playlistId) {
      setSelectedTrack(null);
    }

    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    try {
      const response = await fetch("/api/playlist/save", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPlaylistId: playlistId }),
      });
      // console.log('[AllPlaylistsPage] Delete playlist response:', response.status);
    } catch (error) {
      console.error('[AllPlaylistsPage] Error deleting playlist:', error);
    }
  };

  const getCurrentTrackUri = () => {
    if (!selectedTrack) return null;
    const playlist = playlists.find(p => p.id === selectedTrack.playlistId);
    const track = playlist?.tracks.find(t => t.id === selectedTrack.id);
    if (!track?.spotifyId) return null;
    return `spotify:track:${track.spotifyId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTrackUri = getCurrentTrackUri();

  return (
    <div className="relative">
      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-4xl mb-8 text-center">Your Playlists</h1>

      {currentTrackUri && (
        <div className="sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8 bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-5xl mx-auto p-4">
            <SpotifyPlayer trackUri={currentTrackUri} />
          </div>
        </div>
      )}

      <div className={currentTrackUri ? "pt-4" : ""}>
        {playlists.length === 0 ? (
          <div className="text-center py-16 px-4 bg-card border rounded-lg">
            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold text-foreground">No playlists yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Go to the "Create Playlist" page to generate your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((pl) => (
              <div key={pl.id} className="bg-card border rounded-xl shadow-sm overflow-hidden transition-all">
                <div className="flex justify-between items-center p-4">
                  <div className="truncate">
                    <h3 className="font-semibold text-foreground truncate">{pl.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pl.sentiment ? `Mood: ${pl.sentiment} · ` : ''}
                      {pl.tracks.length} songs · Created {new Date(pl.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0 ml-4">
                    {pl.spotifyPlaylistId && (
                      <a
                        href={`https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        aria-label="Open in Spotify"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeletePlaylist(pl.id)}
                      className="p-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      aria-label="Delete playlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${expanded === pl.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {expanded === pl.id && (
                  <div className="border-t">
                    <ul className="divide-y">
                      {pl.tracks.map((track, idx) => (
                        <li key={track.id} className="flex items-center gap-4 p-3 group">
                          <div className="flex items-center gap-4 flex-1 truncate">
                            <span className="text-muted-foreground text-sm w-6 text-center">{idx + 1}</span>
                            <button
                              onClick={() => handlePlayTrack(track, pl.id)}
                              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-muted/50 hover:bg-primary/10 cursor-pointer transition-colors"
                            >
                              {selectedTrack?.id === track.id && selectedTrack?.playlistId === pl.id ? (
                                <Pause className="h-4 w-4 text-primary" />
                              ) : (
                                <Play className="h-4 w-4 text-primary" />
                              )}
                            </button>
                            <div className="truncate">
                              <p className="text-foreground font-medium truncate">{track.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{track.artists?.join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm font-mono hidden sm:block">
                              {Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                            </span>
                            <button
                              onClick={() => handleDeleteTrack(pl.id, track.id)}
                              className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
    </div>
  );
}
