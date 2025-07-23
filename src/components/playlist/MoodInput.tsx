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
  const [moodText, setMoodText] =useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [numSongs, setNumSongs] = useState(10);

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
    <div className="w-full mx-auto p-6 sm:p-8 bg-card border rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Describe Your Vibe
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="mood-text" className="sr-only">Your Vibe</label>
          <textarea
            id="mood-text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="e.g., 'A rainy afternoon, feeling nostalgic and cozy' or 'Upbeat 80s pop for a road trip!'"
            className="w-full h-28 p-3 bg-secondary/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-ring focus:bg-background transition-colors resize-none text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              Playlist Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., My Perfect Focus Mix"
              className="w-full p-3 bg-secondary/50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-ring focus:bg-background transition-colors text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="num-songs" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Number of Songs
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setNumSongs(Math.max(5, numSongs - 1))}
                className="p-3 bg-secondary rounded-l-lg text-muted-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                id="num-songs"
                type="number"
                min={5}
                max={50}
                value={numSongs}
                readOnly
                className="w-16 p-3 text-center bg-background border-y text-foreground focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setNumSongs(Math.min(50, numSongs + 1))}
                className="p-3 bg-secondary rounded-r-lg text-muted-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
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
          className="w-full mt-4 py-3 px-6 rounded-lg text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Playlist...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Create Playlist</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
