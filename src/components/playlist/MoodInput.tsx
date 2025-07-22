"use client";

import { useState } from "react";
import {
  Music2,
  ListMusic,
  Tag,
  Plus,
  Minus,
  Loader2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

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
    <div className="max-w-2xl mx-auto p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          How are you feeling?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 flex items-center gap-2">
          <MessageSquareText className="w-4 h-4" />
          Describe your mood or the vibe you're looking for, and we'll create a perfect playlist for you.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Your Vibe
          </label>
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="E.g., 'Feeling energetic and ready to dance!' or 'Need something calm to focus...'"
            className="w-full h-32 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            Playlist Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description for your playlist (optional)"
            className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Mood Tag
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="E.g., happy, chill, workout"
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              Number of Songs
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setNumSongs(Math.max(1, numSongs - 1))}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-l-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                disabled={isLoading}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={20}
                value={numSongs}
                onChange={(e) => setNumSongs(Number(e.target.value))}
                className="w-20 p-3 text-center bg-white dark:bg-gray-800 border-y-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setNumSongs(Math.min(20, numSongs + 1))}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-r-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !moodText.trim()}
          className="w-full mt-8 py-4 px-6 rounded-xl text-white font-medium transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-gray-300 dark:text-gray-900 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed group"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Your Perfect Playlist...</span>
              </>
            ) : (
              <>
                <Music2 className="w-5 h-5" />
                <span>Create Playlist</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
} 