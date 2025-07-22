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
        description: description.trim() || "A playlist for your mood",
        mood: mood.trim() || "chill",
        numSongs: numSongs || 5,
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">How are you feeling?</h2>
      <p className="text-gray-600 mb-4">
        Describe your mood or the vibe you're looking for, and we'll create a
        perfect playlist for you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={moodText}
          onChange={(e) => setMoodText(e.target.value)}
          placeholder="Describe your vibe or what you want to listen to..."
          className="w-full h-24 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Playlist description (optional)"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood (e.g. happy, chill, workout)"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <div className="flex items-center gap-4">
          <label htmlFor="numSongs" className="font-medium text-gray-700">Number of Songs:</label>
          <input
            id="numSongs"
            type="number"
            min={1}
            max={20}
            value={numSongs}
            onChange={(e) => setNumSongs(Number(e.target.value))}
            className="w-20 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !moodText.trim()}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
            isLoading || !moodText.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Generating Playlist..." : "Create Playlist"}
        </button>
      </form>
    </div>
  );
} 