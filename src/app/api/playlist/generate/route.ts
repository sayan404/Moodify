import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { PrismaClient, Prisma } from "@prisma/client";
import sentiment from "sentiment";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const analyzer = new sentiment();

// Predefined genres since genre seeds endpoint is not accessible
const AVAILABLE_GENRES = [
  "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal",
  "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house",
  "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal",
  "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm",
  "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel",
  "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle",
  "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop",
  "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin",
  "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies",
  "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop",
  "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock",
  "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly",
  "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska",
  "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop",
  "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music"
];

// Mood to music attributes mapping
const moodToAttributes = {
  positive: {
    target_valence: 0.8,
    target_energy: 0.8,
    target_tempo: 120,
    seed_genres: ["dance", "pop", "power-pop", "work-out", "edm"],
  },
  negative: {
    target_valence: 0.2,
    target_energy: 0.2,
    target_tempo: 90,
    seed_genres: ["acoustic", "ambient", "rainy-day", "sleep", "study"],
  },
  neutral: {
    target_valence: 0.5,
    target_energy: 0.5,
    target_tempo: 100,
    seed_genres: ["pop", "rock", "indie", "alternative", "electronic"],
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
    
    if (!session?.user || !session.accessToken) {
      console.log('Authentication failed:', {
        hasSession: !!session,
        hasUser: !!session?.user,
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

    // Initialize Spotify API with proper scopes
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
      // Get recommendations directly without fetching genres
      console.log('Requesting Spotify recommendations with params:', {
        limit: 20,
        seed_genres: attributes.seed_genres.slice(0, 5),
        target_valence: attributes.target_valence,
        target_energy: attributes.target_energy,
        target_tempo: attributes.target_tempo,
      });

      const recommendations = await spotify.recommendations.get({
        limit: 20,
        seed_genres: attributes.seed_genres.slice(0, 5),
        target_valence: attributes.target_valence,
        target_energy: attributes.target_energy,
        target_tempo: attributes.target_tempo,
      });

      if (!recommendations.tracks || recommendations.tracks.length === 0) {
        console.log('No tracks found in recommendations');
        throw new Error("No tracks found for the given mood");
      }

      console.log('Received recommendations:', {
        trackCount: recommendations.tracks.length,
        firstTrack: recommendations.tracks[0]?.name,
        genres: attributes.seed_genres.slice(0, 5),
      });

      // Create playlist with tracks
      const result = await prisma.$transaction(async (tx) => {
        // Create the playlist
        const playlist = await tx.playlist.create({
          data: {
            name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`,
            spotifyPlaylistId: "",
            sentiment: mood,
            userId: session.user.id,
          },
        });

        // Create all tracks for the playlist
        const tracksData = recommendations.tracks.map(track => ({
          id: randomUUID(),
          spotifyId: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          albumName: track.album.name,
          duration: track.duration_ms,
          playlistId: playlist.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Insert tracks using raw SQL
        await tx.$executeRaw`
          INSERT INTO "Track" (
            "id", "spotifyId", "name", "artists", "albumName", 
            "duration", "playlistId", "createdAt", "updatedAt"
          )
          VALUES ${Prisma.join(
            tracksData.map(
              track => Prisma.sql`(
                ${track.id}, ${track.spotifyId}, ${track.name},
                ${track.artists}, ${track.albumName}, ${track.duration},
                ${track.playlistId}, ${track.createdAt}, ${track.updatedAt}
              )`
            )
          )}
        `;

        // Return combined result
        return {
          ...playlist,
          tracks: tracksData,
        };
      });

      return NextResponse.json({
        playlist: {
          id: result.id,
          name: result.name,
          tracks: result.tracks,
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