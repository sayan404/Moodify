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

// Mood-based music attributes with curated seeds including Bollywood
const moodToAttributes = {
  positive: {
    target_valence: 0.8,
    target_energy: 0.8,
    target_tempo: 120,
    seed_genres: ["dance", "pop", "happy", "party", "electronic", "bollywood"],
    // Popular upbeat artists including Bollywood
    artists: [
      "6sFIWsNpZYqfjUpaCgueju", // Carly Rae Jepsen
      "3WrFJ7ztbogyGnTHbHJFl2", // The Beatles
      "7dGJo4pcD2V6oG8kP0tJRR", // Eminem
      "06HL4z0CvFAxyc27GXpf02", // Taylor Swift
      "1uNFoZAHBGtllmzznpCI3s", // Justin Bieber
      "1mYsTxnqsietFxj1OgoGbG", // A.R. Rahman
      "0oOet2f43Rv0hHeMWx1BrY", // Arijit Singh
      "5f4QpKfy7ptCHwTqspnSJI", // Neha Kakkar
      "6LEG9Ld1aLImEFEVHdWNSB", // Badshah
      "2GoeZ0qOTt6kjsWW4eA6LS", // Yo Yo Honey Singh
    ],
    // Popular upbeat tracks including Bollywood
    tracks: [
      "1301WleyT98MSxVHPZCA6M", // Happy by Pharrell Williams
      "4Km5HrUvYTaSUfiSGPJeQR", // Bad Guy by Billie Eilish
      "0E4Y1XIbs8GrAT1YqVy6dq", // Wonder by Shawn Mendes
      "1uNFoZAHBGtllmzznpCI3s", // Justin Bieber
      "5cF0dROlMOK5uNZtivgu50", // London Thumakda
      "2RttW7RAu5nOAfq6YFvApB", // Kar Gayi Chull
      "1HNs07uZxZniPNmn41cPWL", // Badtameez Dil
      "1Y2tEzgYtVhYXLvHC8xo7I", // Chammak Challo
      "4UHqbDNhMGyhMo8mG1kidw", // Desi Girl
    ],
  },
  negative: {
    target_valence: 0.2,
    target_energy: 0.2,
    target_tempo: 90,
    seed_genres: ["acoustic", "ambient", "piano", "sleep", "rainy-day", "bollywood"],
    // Melancholic/emotional artists including Bollywood
    artists: [
      "4gzpq5DPGxSnKTe4SA8HAU", // Coldplay
      "4dpARuHxo51G3z768sgnrY", // Adele
      "6eUKZXaKkcviH0Ku9w2n3V", // Ed Sheeran
      "4LEiUm1SRbFMgfqnQTwUbQ", // Bon Iver
      "00FQb4jTyendYWaN8pK0wa", // Lana Del Rey
      "0oOet2f43Rv0hHeMWx1BrY", // Arijit Singh
      "4YRxDV8wJFPHPTeXepOstw", // Atif Aslam
      "6xElGyunMSlnuJ2vabDUWA", // Shreya Ghoshal
      "5rQoBDKFnd1n6BkdbgVaRL", // late Kishore Kumar
      "0Lc14YgqmL3Kf9EJgXVGvQ", // late Mohammed Rafi
    ],
    // Emotional/slow tracks including Bollywood
    tracks: [
      "4RCWB3V8V0dignt99LZ8vH", // Say Something by A Great Big World
      "0pqnGHJpmpxLKifKRmU6WP", // Bright Eyes - First Day of My Life
      "7qEHsqek33rTcFNT9PFqLf", // Someone You Loved by Lewis Capaldi
      "6rbeWjEavBHvX2kr6lSogS", // Tum Hi Ho
      "1T6ZFqHnDrRiFBAVz3kwtG", // Channa Mereya
      "6K9r3hJ88QAFXAJyeEQN7k", // Agar Tum Saath Ho
      "0WqIKmW4BTrj3eJFmnCKMv", // Kabira
      "2RCcz2q2ikkKYs6kJaeJeX", // Ae Dil Hai Mushkil
    ],
  },
  neutral: {
    target_valence: 0.5,
    target_energy: 0.5,
    target_tempo: 100,
    seed_genres: ["pop", "rock", "indie", "alternative", "electronic", "bollywood"],
    // Versatile artists including Bollywood
    artists: [
      "4dpARuHxo51G3z768sgnrY", // Adele
      "53XhwfbYqKCa1cC15pYq2q", // Imagine Dragons
      "6KImCVD70vtIoJWnq6nGn3", // Harry Styles
      "1mYsTxnqsietFxj1OgoGbG", // A.R. Rahman
      "0oOet2f43Rv0hHeMWx1BrY", // Arijit Singh
      "6xElGyunMSlnuJ2vabDUWA", // Shreya Ghoshal
      "4YRxDV8wJFPHPTeXepOstw", // Atif Aslam
      "2GoeZ0qOTt6kjsWW4eA6LS", // Yo Yo Honey Singh
    ],
    // Mixed-mood tracks including Bollywood
    tracks: [
      "06JvOZ39sK8D8SqiqfaxDU", // Somewhere Only We Know by Keane
      "0VjIjW4GlUZAMYd2vXMi3b", // Blinding Lights by The Weeknd
      "7qiZfU4dY1lWllzX7mPBI3", // Shape of You by Ed Sheeran
      "4nK5YrxbMGZstTLbvj6Gxw", // Gerua
      "0L1FJ3kzP8S8YHvHjZS99Z", // Malang
      "6rgwkHoFJKHhGpUZPbxWrz", // Hawayein
      "5dAPRPt4kQmQnVNtCQHxoa", // Matargashti
      "3t7EmXUkEzP2kRPUkUdUCe", // Jeena Jeena
    ],
  },
};

// Helper function to get seed tracks based on mood with region preference
async function getSeedTracks(mood: string, accessToken: string): Promise<string[]> {
  try {
    // First try to get track information to validate the IDs
    const tracks = moodToAttributes[mood].tracks;
    const response = await fetch(
      `https://api.spotify.com/v1/tracks?ids=${tracks.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to validate tracks, using fallback');
      // Mix of international and Bollywood tracks in fallback
      return tracks.slice(0, 2); // Use first two tracks as fallback
    }

    const data = await response.json();
    // Filter out any null tracks (invalid IDs)
    const validTracks = data.tracks.filter(track => track !== null).map(track => track.id);

    // Ensure mix of international and Bollywood tracks
    const bollywoodTracks = validTracks.slice(4, 6); // Take 2 Bollywood tracks
    const internationalTracks = validTracks.slice(0, 2); // Take 2 international tracks
    return [...internationalTracks, ...bollywoodTracks].slice(0, 2); // Return max 2 tracks
  } catch (error) {
    console.warn('Error validating tracks:', error);
    return moodToAttributes[mood].tracks.slice(0, 2);
  }
}

// Helper function to get seed artists based on mood with region preference
async function getSeedArtists(mood: string, accessToken: string): Promise<string[]> {
  try {
    // First try to get artist information to validate the IDs
    const artists = moodToAttributes[mood].artists;
    const response = await fetch(
      `https://api.spotify.com/v1/artists?ids=${artists.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Failed to validate artists, using fallback');
      // Mix of international and Bollywood artists in fallback
      return artists.slice(0, 2);
    }

    const data = await response.json();
    // Filter out any null artists (invalid IDs)
    const validArtists = data.artists.filter(artist => artist !== null).map(artist => artist.id);

    // Ensure mix of international and Bollywood artists
    const bollywoodArtists = validArtists.slice(4, 6); // Take 2 Bollywood artists
    const internationalArtists = validArtists.slice(0, 2); // Take 2 international artists
    return [...internationalArtists, ...bollywoodArtists].slice(0, 2); // Return max 2 artists
  } catch (error) {
    console.warn('Error validating artists:', error);
    return moodToAttributes[mood].artists.slice(0, 2);
  }
}

// Helper function to validate and filter genres
async function getValidGenres(genres: string[]): Promise<string[]> {
  const validGenres = genres.filter(genre => AVAILABLE_GENRES.includes(genre));
  if (validGenres.length === 0) {
    return ["pop"]; // fallback to pop if no valid genres
  }
  return validGenres;
}

// Helper function to get recommendation seeds while respecting Spotify's 5-seed limit
async function getRecommendationSeeds(
  mood: string,
  genres: string[],
  accessToken: string
): Promise<{
  seed_artists: string;
  seed_tracks: string;
  seed_genres: string;
}> {
  try {
    // Get and validate seeds
    const [seedArtists, seedTracks, validGenres] = await Promise.all([
      getSeedArtists(mood, accessToken),
      getSeedTracks(mood, accessToken),
      getValidGenres(genres),
    ]);

    // Distribute the 5 available seed slots
    // Strategy: 2 artists, 2 tracks, 1 genre for a good mix
    return {
      seed_artists: seedArtists.slice(0, 2).join(','),
      seed_tracks: seedTracks.slice(0, 2).join(','),
      seed_genres: validGenres.slice(0, 1).join(','), // Just one genre
    };
  } catch (error) {
    console.error('Error getting recommendation seeds:', error);
    // Fallback to just genres if there's an error
    const validGenres = await getValidGenres(genres);
    return {
      seed_artists: '',
      seed_tracks: '',
      seed_genres: validGenres.slice(0, 5).join(','),
    };
  }
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
    const seeds = await getRecommendationSeeds(mood, attributes.seed_genres, session.accessToken);

    console.log('Selected music attributes:', {
      ...attributes,
      ...seeds,
    });

    // Make direct fetch call to Spotify API
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...seeds,
        target_valence: attributes.target_valence.toString(),
        target_energy: attributes.target_energy.toString(),
        target_tempo: attributes.target_tempo.toString(),
      });

      console.log('Requesting Spotify recommendations with params:', Object.fromEntries(params));
      console.log('Using access token:', session.accessToken);

      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response from Spotify recommendations API:', response.ok, response.status, response.statusText, response.headers);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }
      const recommendations = await response.json();
      console.log('Response from Spotify recommendations API:', recommendations);

      // Log detailed response data
      console.log('Spotify API Response:', {
        seeds: recommendations.seeds,
        tracks: recommendations.tracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          album: track.album.name,
          popularity: track.popularity,
          preview_url: track.preview_url,
          external_url: track.external_urls?.spotify,
          uri: track.uri,
          duration_ms: track.duration_ms,
          explicit: track.explicit,
          // Audio features if available
          features: {
            danceability: track.danceability,
            energy: track.energy,
            key: track.key,
            loudness: track.loudness,
            mode: track.mode,
            speechiness: track.speechiness,
            acousticness: track.acousticness,
            instrumentalness: track.instrumentalness,
            liveness: track.liveness,
            valence: track.valence,
            tempo: track.tempo,
          }
        })),
        trackCount: recommendations.tracks.length,
        firstTrack: {
          name: recommendations.tracks[0]?.name,
          artist: recommendations.tracks[0]?.artists[0]?.name,
        },
        genres: attributes.seed_genres, // Use attributes.seed_genres as they are already validated
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