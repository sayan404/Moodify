"use client";
import { useState } from "react";
import MoodInput from "../../../components/playlist/MoodInput";
import PlaylistDisplay from "../../../components/playlist/PlaylistDisplay";
import { AnimatePresence, motion } from "framer-motion";

export default function CreatePlaylistPage() {
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodSubmit = async (data: { moodText: string; description: string; mood: string; numSongs: number }) => {
    setIsLoading(true);
    setError(null);
    setGeneratedPlaylist(null);
    try {
      const response = await fetch("/api/playlist/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to generate playlist");
      }

      setGeneratedPlaylist(resData.playlist);
    } catch (error: any) {
      console.error("Error generating playlist:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
          Create a New Playlist
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Describe your mood or the vibe you're looking for, and let our AI craft the perfect playlist for you.
        </p>
      </div>

      <MoodInput onSubmit={handleMoodSubmit} isLoading={isLoading} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 text-center bg-destructive/10 text-destructive p-4 rounded-md"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {generatedPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-8"
          >
            <PlaylistDisplay playlist={generatedPlaylist} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
