"use client";

import { useState } from "react";

interface MoodInputProps {
  onSubmit: (moodText: string) => Promise<void>;
  isLoading: boolean;
}

export default function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [moodText, setMoodText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim()) {
      onSubmit(moodText.trim());
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
          placeholder="E.g., 'Feeling energetic and ready to conquer the day!' or 'Need something calm and peaceful to unwind...'"
          className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        
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