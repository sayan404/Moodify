"use client";

import { useState } from "react";

interface MoodInputProps {
  onSubmit: (data: { moodText: string; description: string; mood: string; numSongs: number }) => Promise<void>;
  isLoading: boolean;
}

export default function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [moodText, setMoodText] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [numSongs, setNumSongs] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim()) {
      onSubmit({
        moodText: moodText.trim(),
        description: description.trim(),
        mood: mood.trim(),
        numSongs,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">How are you feeling?</h2>
        <p className="text-gray-600 dark:text-gray-400 text-[12px]">
          Describe your mood or the vibe you're looking for, and we'll create a perfect playlist for you.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Vibe
          </label>
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="E.g., 'Feeling energetic and ready to dance!' or 'Need something calm to focus...'"
            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Playlist Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description for your playlist (optional)"
            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mood
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="E.g., happy, chill, workout"
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Songs
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setNumSongs(Math.max(1, numSongs - 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={20}
                value={numSongs}
                onChange={(e) => setNumSongs(Number(e.target.value))}
                className="w-20 p-2 text-center bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setNumSongs(Math.min(20, numSongs + 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-r-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !moodText.trim()}
          className="w-full mt-8 py-4 px-6 rounded-lg text-white font-medium transition-all relative overflow-hidden bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 dark:text-gray-900 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? "Creating Your Perfect Playlist..." : "Create Playlist"}
          </div>
        </button>
      </form>
    </div>
  );
} 