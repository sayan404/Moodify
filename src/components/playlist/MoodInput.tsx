"use client";

import { useState, useRef } from "react";
import {
  Music2,
  ListMusic,
  Tag,
  Plus,
  Minus,
  Loader2,
  MessageSquareText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";

interface MoodInputProps {
  onSubmit: (data: {
    moodText: string;
    description: string;
    mood: string;
    numSongs: number;
    songLanguage?: string;
    timeline?: string;
    singer?: string;
    genre?: string;
    energy?: string;
    tempo?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [moodText, setMoodText] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [numSongs, setNumSongs] = useState(10);
  const [songLanguage, setSongLanguage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [singer, setSinger] = useState("");
  const [genre, setGenre] = useState("");
  const [energy, setEnergy] = useState("");
  const [tempo, setTempo] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const optionalFieldsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim()) {
      onSubmit({
        moodText: moodText.trim(),
        description: description.trim(),
        mood: mood.trim(),
        numSongs,
        songLanguage: songLanguage.trim(),
        timeline: timeline.trim(),
        singer: singer.trim(),
        genre: genre.trim(),
        energy: energy.trim(),
        tempo: tempo.trim(),
      });
    }
  };

  const inputClassName = "w-[90%] mx-1 p-3 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:bg-secondary/20 hover:bg-secondary/15 transition-all duration-200 text-foreground placeholder:text-muted-foreground/50";
  const inputClassNameTextArea = "w-full mx-auto p-3 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:bg-secondary/20 hover:bg-secondary/15 transition-all duration-200 text-foreground placeholder:text-muted-foreground/50";
  
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
            className={`${inputClassNameTextArea} h-28 resize-none`}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out group"
          >
            <Settings2 className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:rotate-90" />
            {showOptionalFields ? "Hide" : "Show"} Advanced Options
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                showOptionalFields ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>

          <div
            ref={optionalFieldsRef}
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ease-in-out overflow-hidden ${
              showOptionalFields ? 'opacity-100 max-h-[1000px] pt-4 border-t border-secondary/20' : 'opacity-0 max-h-0'
            }`}
          >
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  Playlist Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., My Perfect Focus Mix"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="genre" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Music2 className="w-4 h-4" />
                  Genre
                </label>
                <input
                  id="genre"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Rock, Pop, Jazz, Classical"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="song-language" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4" />
                  Song Language
                </label>
                <input
                  id="song-language"
                  type="text"
                  value={songLanguage}
                  onChange={(e) => setSongLanguage(e.target.value)}
                  placeholder="e.g., Hindi, English, Bengali"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="timeline" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Timeline
                </label>
                <input
                  id="timeline"
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g., 90s, 2000s, 70s"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="singer" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Music2 className="w-4 h-4" />
                  Preferred Singer
                </label>
                <input
                  id="singer"
                  type="text"
                  value={singer}
                  onChange={(e) => setSinger(e.target.value)}
                  placeholder="e.g., AR Rahman, Taylor Swift"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="energy" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Energy Level
                </label>
                <input
                  id="energy"
                  type="text"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  placeholder="e.g., High, Medium, Low, Chill"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>

              <div className="mb-2 space-y-2">
                <label htmlFor="tempo" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tempo
                </label>
                <input
                  id="tempo"
                  type="text"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  placeholder="e.g., Fast, Slow, Medium, Dance"
                  className={inputClassName}
                  disabled={isLoading}
                />
              </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            type="submit"
            disabled={isLoading || !moodText.trim()}
            className="flex-1 mr-4 py-3 px-6 rounded-lg text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

          <div className="flex items-center bg-secondary/10 rounded-lg border border-secondary/20">
            <button
              type="button"
              onClick={() => setNumSongs(Math.max(1, numSongs - 1))}
              className="p-3 text-muted-foreground hover:bg-secondary/20 transition-colors focus:outline-none rounded-l-lg"
              disabled={isLoading}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-3 py-2 border-x border-secondary/20">
              <label htmlFor="num-songs" className="block text-xs font-medium text-muted-foreground mb-1">No of Songs</label>
              <input
                id="num-songs"
                type="number"
                min={1}
                max={50}
                value={numSongs}
                readOnly
                className="w-18 text-center bg-transparent text-foreground focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={() => setNumSongs(Math.min(50, numSongs + 1))}
              className="p-3 text-muted-foreground hover:bg-secondary/20 transition-colors focus:outline-none rounded-r-lg"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
