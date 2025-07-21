import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import sentiment from "sentiment";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const prisma = new PrismaClient();
const analyzer = new sentiment();

// Mood to music attributes mapping
const moodToAttributes = {
  positive: {
    minValence: 0.6,
    minEnergy: 0.5,
    targetTempo: 120,
  },
  negative: {
    maxValence: 0.4,
    maxEnergy: 0.4,
    targetTempo: 90,
  },
  neutral: {
    targetValence: 0.5,
    targetEnergy: 0.5,
    targetTempo: 100,
  },
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moodText } = await request.json();
    if (!moodText) {
      return NextResponse.json(
        { error: "Mood text is required" },
        { status: 400 }
      );
    }

    // Analyze sentiment
    const analysis = analyzer.analyze(moodText);
    const mood = analysis.score > 0 ? "positive" : analysis.score < 0 ? "negative" : "neutral";
    const attributes = moodToAttributes[mood];

    // Initialize Spotify API
    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      session.accessToken as string
    );

    // Get recommendations based on mood
    const recommendations = await spotify.recommendations.get({
      limit: 20,
      ...attributes,
      seed_genres: ["pop", "rock", "indie", "electronic"],
    });

    // Format tracks
    const tracks = recommendations.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      albumName: track.album.name,
      duration: track.duration_ms,
    }));

    // Create playlist in database
    const playlist = await prisma.playlist.create({
      data: {
        name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
        spotifyPlaylistId: "", // Will be set when saved to Spotify
        sentiment: mood,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        tracks,
        mood,
      },
    });
  } catch (error) {
    console.error("Error generating playlist:", error);
    return NextResponse.json(
      { error: "Failed to generate playlist" },
      { status: 500 }
    );
  }
} 