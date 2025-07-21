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
    min_valence: 0.6,
    min_energy: 0.5,
    target_tempo: 120,
    seed_genres: ["pop", "dance", "happy"],
  },
  negative: {
    max_valence: 0.4,
    max_energy: 0.4,
    target_tempo: 90,
    seed_genres: ["acoustic", "ambient", "sad"],
  },
  neutral: {
    target_valence: 0.5,
    target_energy: 0.5,
    target_tempo: 100,
    seed_genres: ["pop", "rock", "indie"],
  },
};

export async function POST(request: Request) {
  try {
    console.log('Starting playlist generation...');
    const session = await getServerSession(options);
    console.log('Session data:', {
      exists: !!session,
      user: session?.user,
      accessToken: session?.accessToken ? 'Present' : 'Missing',
      userFields: session?.user ? Object.keys(session.user) : [],
    });
    
    if (!session?.user?.id || !session.accessToken) {
      console.log('Authentication failed:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        hasAccessToken: !!session.accessToken,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moodText } = await request.json();
    console.log('Received mood text:', moodText);

    if (!moodText) {
      console.log('Missing mood text in request');
      return NextResponse.json({ error: "Mood text is required" }, { status: 400 });
    }

    // Analyze sentiment
    const analysis = analyzer.analyze(moodText);
    console.log('Sentiment analysis result:', {
      text: moodText,
      score: analysis.score,
      comparative: analysis.comparative,
      tokens: analysis.tokens,
    });

    const mood = analysis.score > 0 ? "positive" : analysis.score < 0 ? "negative" : "neutral";
    console.log('Determined mood:', mood);

    const attributes = moodToAttributes[mood];
    console.log('Selected music attributes:', attributes);

    // Initialize Spotify API
    console.log('Initializing Spotify API with token');
    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      {
        access_token: session.accessToken,
        token_type: "Bearer",
        expires_in: 3600000,
        refresh_token: "",
      }
    );

    try {
      // Get available genres
      console.log('Fetching available Spotify genres...');
      const { genres } = await spotify.recommendations.genreSeeds();
      console.log('Available genres:', genres);

      const validGenres = attributes.seed_genres.filter(genre => genres.includes(genre));
      console.log('Selected valid genres:', validGenres);
      
      // Get recommendations
      console.log('Requesting Spotify recommendations with params:', {
        limit: 20,
        seed_genres: validGenres.length > 0 ? validGenres : ["pop"],
        ...attributes,
      });

      const recommendations = await spotify.recommendations.get({
        limit: 20,
        seed_genres: validGenres.length > 0 ? validGenres : ["pop"],
        ...attributes,
      });

      console.log('Received recommendations:', {
        trackCount: recommendations.tracks?.length || 0,
        firstTrack: recommendations.tracks?.[0]?.name,
      });

      if (!recommendations.tracks || recommendations.tracks.length === 0) {
        console.log('No tracks found in recommendations');
        throw new Error("No tracks found for the given mood");
      }

      // Step 1: Create playlist
      const playlist = await prisma.playlist.create({
        data: {
          name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
          spotifyPlaylistId: "",
          sentiment: mood,
          userId: session.user.id,
        },
      });

      // Step 2: Create tracks one by one
      const createdTracks = [];
      for (const track of recommendations.tracks) {
        const createdTrack = await prisma.$queryRaw`
          INSERT INTO "tracks" ("id", "spotifyId", "name", "artists", "albumName", "duration", "playlistId", "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            ${track.id},
            ${track.name},
            ${track.artists.map(artist => artist.name)},
            ${track.album.name},
            ${track.duration_ms},
            ${playlist.id},
            NOW(),
            NOW()
          )
          RETURNING *;
        `;
        createdTracks.push(createdTrack[0]);
      }

      return NextResponse.json({
        playlist: {
          id: playlist.id,
          name: playlist.name,
          tracks: createdTracks,
          mood,
        },
      });
    } catch (spotifyError) {
      console.error('Spotify API Error details:', {
        error: spotifyError,
        message: spotifyError.message,
        stack: spotifyError.stack,
      });
      return NextResponse.json(
        { error: "Failed to get recommendations from Spotify" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error details:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to generate playlist" },
      { status: 500 }
    );
  }
} 