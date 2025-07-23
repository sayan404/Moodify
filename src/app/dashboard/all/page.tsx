"use client";
import { useEffect, useState } from "react";
import { ExternalLink, ChevronDown, Loader2, Music, Pause, Play, Trash2 } from "lucide-react";

export default function AllPlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<{ id: string; audio: HTMLAudioElement } | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      setLoading(true);
      try {
        const res = await fetch("/api/playlist/save?mine=true");
        const data = await res.json();
        setPlaylists(data.playlists || []);
      } catch (e) {
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  useEffect(() => {
    return () => {
      playingTrack?.audio.pause();
    };
  }, [playingTrack]);

  const handlePlayPreview = (track: any) => {
    if (playingTrack?.id === track.id) {
      playingTrack.audio.pause();
      setPlayingTrack(null);
    } else {
      playingTrack?.audio.pause();
      if (track.preview_url) {
        const audio = new Audio(track.preview_url);
        audio.play();
        audio.onended = () => setPlayingTrack(null);
        setPlayingTrack({ id: track.id, audio });
      }
    }
  };

  const handleDeleteTrack = async (playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId ? { ...p, tracks: p.tracks.filter((t: any) => t.id !== trackId) } : p
      )
    );
    await fetch("/api/playlist/save/track", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dbPlaylistId: playlistId, trackId }),
    });
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!window.confirm("Are you sure you want to delete this entire playlist? This cannot be undone.")) return;
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    await fetch("/api/playlist/save", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dbPlaylistId: playlistId }),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8 text-center">Your Playlists</h1>
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
                    className="p-2 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${expanded === pl.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {expanded === pl.id && (
                <div className="border-t">
                  <ul className="divide-y">
                    {pl.tracks.map((track: any, idx: number) => (
                      <li key={track.id} className="flex items-center gap-4 p-3 group">
                        <div className="flex items-center gap-4 flex-1 truncate">
                          <span className="text-muted-foreground text-sm w-6 text-center">{idx + 1}</span>
                          <button
                            onClick={() => handlePlayPreview(track)}
                            disabled={!track.preview_url}
                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary/10 disabled:cursor-not-allowed transition-colors"
                          >
                            {playingTrack?.id === track.id ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
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
                            className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}
