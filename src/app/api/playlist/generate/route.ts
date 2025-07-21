import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { PrismaClient, Prisma } from "@prisma/client";
import sentiment from "sentiment";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const analyzer = new sentiment();

// Spotify's official genres (these are the ones that actually work with their API)
const AVAILABLE_GENRES = [
  "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", 
  "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", 
  "british", "cantopop", "chicago-house", "children", "chill", "classical", 
  "club", "comedy", "country", "dance", "dancehall", "death-metal", 
  "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", 
  "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", 
  "french", "funk", "garage", "german", "gospel", "goth", "grindcore", 
  "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", 
  "heavy-metal", "hip-hop", "house", "idm", "indian", "indie", "indie-pop", 
  "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", 
  "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", 
  "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", 
  "new-release", "opera", "pagode", "party", "philippines-opm", "piano", 
  "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", 
  "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", 
  "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", 
  "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", 
  "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", 
  "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", 
  "turkish", "work-out", "world-music"
];

// Mood to music attributes mapping with verified Spotify genres
const moodToAttributes = {
  positive: {
    target_valence: 0.8,
    target_energy: 0.8,
    target_tempo: 120,
    seed_genres: ["dance", "pop", "happy", "party", "electronic"],
  },
  negative: {
    target_valence: 0.2,
    target_energy: 0.2,
    target_tempo: 90,
    seed_genres: ["acoustic", "ambient", "piano", "sleep", "rainy-day"],
  },
  neutral: {
    target_valence: 0.5,
    target_energy: 0.5,
    target_tempo: 100,
    seed_genres: ["pop", "rock", "indie", "alternative", "electronic"],
  },
};

// Helper function to validate and filter genres
function getValidGenres(genres: string[]): string[] {
  const validGenres = genres.filter(genre => AVAILABLE_GENRES.includes(genre));
  if (validGenres.length === 0) {
    return ["pop"]; // fallback to pop if no valid genres
  }
  return validGenres.slice(0, 5); // Spotify allows max 5 seed genres
}

export async function POST(request: Request) {
  try {
    console.log('Starting playlist generation...');
    const session = await getServerSession(options);
    console.log('Session data:', {
      exists: !!session,
      user: session?.user,
      accessToken: session?.accessToken,
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
    const validGenres = getValidGenres(attributes.seed_genres);
    console.log('Selected music attributes:', {
      ...attributes,
      seed_genres: validGenres,
    });

    // Make direct fetch call to Spotify API
    try {
      const params = new URLSearchParams({
        limit: '20',
        seed_genres: validGenres.join(','),
        target_valence: attributes.target_valence.toString(),
        target_energy: attributes.target_energy.toString(),
        target_tempo: attributes.target_tempo.toString(),
      });

      console.log('Requesting Spotify recommendations with params:', Object.fromEntries(params));

      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Spotify API error:', {
          status: response.status,
          statusText: response.statusText,
          body: await response.text(),
        });
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }

      const recommendations = await response.json();
      console.log('Received recommendations:', {
        trackCount: recommendations.tracks?.length || 0,
        firstTrack: recommendations.tracks?.[0]?.name,
        genres: validGenres,
      });

      if (!recommendations.tracks || recommendations.tracks.length === 0) {
        console.log('No tracks found in recommendations');
        throw new Error("No tracks found for the given mood");
      }

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

    } catch (error) {
      console.error('Error details:', {
        error,
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        { error: "Failed to generate playlist" },
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