"use client";
import { useState } from "react";
import MoodInput from "../../../components/playlist/MoodInput";
import PlaylistDisplay from "../../../components/playlist/PlaylistDisplay";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

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
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error}
                {error.includes("maximum limit") && (
                  <Link href="/dashboard/all" className="ml-2 underline">
                    Go to your playlists
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {!generatedPlaylist ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MoodInput onSubmit={handleMoodSubmit} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlaylistDisplay playlist={generatedPlaylist} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
