"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Loader2, Music, Play, Pause, Trash2, ExternalLink } from "lucide-react";
import { FaSpotify } from "react-icons/fa";

interface Track {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  duration: number;
  preview_url?: string;
}

interface Playlist {
  id: string;
  dbPlaylistId: string;
  name: string;
  tracks: Track[];
  mood: string;
  url?: string;
}

interface PlaylistDisplayProps {
  playlist: Playlist;
}

export default function PlaylistDisplay({ playlist: initialPlaylist }: PlaylistDisplayProps) {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPlaylist(initialPlaylist);
  }, [initialPlaylist]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePlayPreview = (track: Track) => {
    if (!track.preview_url) {
      showToast('No preview available for this song', 'error');
      return;
    }
    
    if (playingTrackId === track.id && audio) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      if (audio) audio.pause();
      const newAudio = new Audio(track.preview_url);
      setAudio(newAudio);
      newAudio.play();
      newAudio.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handleSaveToSpotify = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/playlist/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: playlist.id, dbPlaylistId: playlist.dbPlaylistId, tracks: playlist.tracks }),
      });

      if (!response.ok) throw new Error("Failed to save playlist");
      
      setSaved(true);
      showToast('Playlist saved to your Spotify account!');
    } catch (error) {
      console.error("Error saving playlist:", error);
      showToast('Failed to save playlist.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrack = async (trackToDelete: Track) => {
    setPlaylist(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackToDelete.id)
    }));

    try {
      await fetch("/api/playlist/save/track", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPlaylistId: playlist.dbPlaylistId, trackId: trackToDelete.id }),
      });
    } catch (error) {
      console.error("Failed to delete track from DB:", error);
      // Optionally revert state or show an error
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-md text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{playlist.name}</h2>
          <p className="text-muted-foreground mt-1">Mood: <span className="font-semibold text-primary">{playlist.mood}</span></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveToSpotify}
            disabled={saving || saved}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-[#1DB954] text-white hover:bg-[#1DB954]/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaSpotify className="h-4 w-4" />}
            {saved ? "Saved to Spotify" : saving ? "Saving..." : "Save to Spotify"}
          </button>
          {playlist.url && saved && (
            <a
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-muted transition-colors flex items-center"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {playlist.tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-md transition-colors group"
          >
            <div className="flex items-center gap-4 flex-1 truncate">
              <span className="text-muted-foreground text-sm w-6 text-center">{index + 1}</span>
              <button
                onClick={() => handlePlayPreview(track)}
                disabled={!track.preview_url}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary/10 disabled:cursor-not-allowed transition-colors"
              >
                {playingTrackId === track.id ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-primary" />}
              </button>
              <div className="truncate">
                <p className="text-foreground font-semibold truncate">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artists.join(", ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-mono hidden sm:block">
                {formatDuration(track.duration)}
              </span>
              <button
                onClick={() => handleDeleteTrack(track)}
                className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
