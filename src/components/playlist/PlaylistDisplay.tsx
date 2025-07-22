"use client";

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
}

interface PlaylistDisplayProps {
  playlist: Playlist;
}

export default function PlaylistDisplay({ playlist }: PlaylistDisplayProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  console.log("playlist from playlist display", playlist);

  const handleSaveToSpotify = async () => {
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

      // Handle success (e.g., show a notification)
    } catch (error) {
      console.error("Error saving playlist:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{playlist.name}</h2>
          <p className="text-gray-600">Based on mood: {playlist.mood}</p>
        </div>
        <button
          onClick={handleSaveToSpotify}
          className="bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-[#1ed760] transition-colors"
        >
          Save to Spotify
        </button>
      </div>

      <div className="space-y-2">
        {playlist.tracks.map((track, index) => (
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
          </div>
        ))}
      </div>
    </div>
  );
} 