import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MAX_PLAYLISTS_PER_USER = 10;

export async function POST(request: Request) {
  console.log("[AI-Playlist] Start request");
  const session = await getServerSession(options);
  console.log("session from playlist route", session);
  console.log("[AI-Playlist] Session from playlist route:", session ? {
    user: session.user,
    accessToken: session.accessToken ? 'Present' : 'Missing',
  } : 'No session');

  if (!session?.user || !session.accessToken) {
    console.log("[AI-Playlist] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user's playlist count
  const prisma = new PrismaClient();
  const playlistCount = await prisma.playlist.count({
    where: { userId: session.user.id }
  });

  if (playlistCount >= MAX_PLAYLISTS_PER_USER) {
    console.log("[AI-Playlist] User has reached playlist limit");
    return NextResponse.json({ 
      error: "You have reached the maximum limit of 10 playlists. Please delete some playlists to create new ones." 
    }, { status: 403 });
  }

  const body = await request.json();
  const { moodText, description, mood, numSongs, songLanguage, timeline, singer, genre, energy, tempo } = body;
  console.log("[AI-Playlist] User input:", { moodText, description, mood, numSongs, songLanguage, timeline, singer, genre, energy, tempo });
  if (!moodText) {
    console.log("[AI-Playlist] No mood text provided");
    return NextResponse.json({ error: "Mood text is required" }, { status: 400 });
  }

  // 1. Call Gemini Flash for analysis
  const geminiPrompt = `
    You are a music expert specializing in creating personalized playlists. Analyze the following user preferences and suggest songs that STRICTLY match their criteria.

    User Input: "${moodText}"
    ${mood ? `Mood: ${mood}` : ""}
    ${description ? `Description: ${description}` : ""}
    ${songLanguage ? `Language: ${songLanguage}` : ""}
    ${timeline ? `Era/Timeline: ${timeline}` : ""}
    ${singer ? `Preferred Artist: ${singer}` : ""}
    ${genre ? `Genre: ${genre}` : ""}
    ${energy ? `Energy Level: ${energy}` : ""}
    ${tempo ? `Tempo: ${tempo}` : ""}
    Number of songs requested: ${numSongs || 5}

    Requirements:
    1. If a specific language is provided (e.g., Hindi, Bengali, Telugu), ONLY suggest songs in that language
    2. If a timeline/era is specified (e.g., 90s, 2000s), ONLY suggest songs from that period
    3. If a specific artist is mentioned, prioritize their songs that match other criteria
    4. If a genre is specified, ONLY suggest songs from that genre or closely related genres
    5. Match the requested energy level (if provided) - high energy for energetic/upbeat, low energy for calm/relaxed
    6. Match the requested tempo (if provided) - consider BPM and rhythm style
    7. Consider the mood and theme from the user's description for song selection
    8. Ensure suggested songs are likely to be available on Spotify

    Analyze and provide:
    - Primary mood (e.g., happy, sad, energetic, nostalgic)
    - Dominant genre (e.g., pop, bollywood, rock, classical)
    - Target era/decade based on input or mood
    - Main theme (e.g., love, party, workout, meditation)
    - Energy level classification
    - Tempo classification
    - ${numSongs || 5} highly relevant song suggestions

    Respond as JSON:
    {
      "mood": "...",
      "genre": "...",
      "era": "...",
      "theme": "...",
      "language": "...",
      "energy_level": "...",
      "tempo": "...",
      "suggested_songs": [
        {
          "title": "...",
          "artist": "...",
          "year": "...",
          "language": "...",
          "genre": "...",
          "energy": "...",
          "tempo": "...",
          "relevance_reason": "Brief explanation of why this song matches the user's criteria"
        }
      ]
    }

    Note: Each suggested song MUST align with ALL specified preferences (language, era, artist, genre, energy, tempo). Do not suggest songs that don't match these criteria.
  `;
  console.log("[AI-Playlist] Gemini prompt:", geminiPrompt);

  const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: geminiPrompt }] }]
    }),
  });
  console.log("[AI-Playlist] Gemini API status:", geminiRes.status);
  const geminiData = await geminiRes.json();
  console.log("[AI-Playlist] Gemini API response:", geminiData);
  const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || geminiData.candidates?.[0]?.content?.text || "";
  let aiResult;
  try {
    // Remove code block markers if present
    const cleaned = geminiText.replace(/```json|```/g, '').trim();
    aiResult = JSON.parse(cleaned);
    console.log("[AI-Playlist] Gemini AI result:", aiResult);
  } catch {
    console.log("[AI-Playlist] Gemini response parse error:", geminiText);
    return NextResponse.json({ error: "Gemini response parse error", raw: geminiText }, { status: 500 });
  }

  // 2. Search Spotify for each suggested song
  const foundTracks: {
    id: string,
    uri: string,
    name: string,
    artists: string[],
    albumName: string,
    duration: number,
    preview_url: string | null
  }[] = [];
  for (const song of aiResult.suggested_songs || []) {
    const q = encodeURIComponent(`${song.title} ${song.artist}`);
    console.log("[AI-Playlist] Searching Spotify for:", song.title, "by", song.artist);
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    console.log("[AI-Playlist] Spotify search status:", searchRes.status);
    const searchData = await searchRes.json();
    console.log("[AI-Playlist] Spotify search data:", searchData);
    const track = searchData.tracks?.items?.[0];
    if (track) {
      foundTracks.push({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artists: track.artists.map((a: any) => a.name),
        albumName: track.album?.name ?? "",
        duration: track.duration_ms ?? 0,
        preview_url: track.preview_url ?? null,  // Add preview URL
      });
      console.log("[AI-Playlist] Found track:", track.name, "by", track.artists.map((a: any) => a.name).join(", "));
    } else {
      console.log("[AI-Playlist] No track found for:", song.title, song.artist);
    }
  }

  if (foundTracks.length === 0) {
    console.log("[AI-Playlist] No tracks found from AI suggestions", aiResult);
    return NextResponse.json({ error: "No tracks found from AI suggestions", aiResult }, { status: 404 });
  }

  // 3. Create a playlist
  console.log("[AI-Playlist] Creating playlist for user:", session.user.id);
  const playlistRes = await fetch(`https://api.spotify.com/v1/users/${session.user.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `AI Playlist: ${aiResult.mood || aiResult.theme || "Your Mood"}`,
      description: description || `Generated by Gemini AI: ${moodText}`,
      public: false
    })
  });
  console.log("[AI-Playlist] Playlist creation status:", playlistRes.status);
  const playlistData = await playlistRes.json();
  console.log("[AI-Playlist] Playlist data:", playlistData);

  // Add error handling for playlist creation
  if (!playlistData.id) {
    console.log("[AI-Playlist] Failed to create playlist:", playlistData);
    return NextResponse.json({ error: "Failed to create playlist", details: playlistData }, { status: playlistRes.status });
  }

  // 4. Add tracks to the playlist
  console.log("[AI-Playlist] Adding tracks to playlist:", foundTracks.map(t => t.uri));
  const addTracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ uris: foundTracks.map(t => t.uri) })
  });
  console.log("[AI-Playlist] Add tracks status:", addTracksRes.status);
  const addTracksData = await addTracksRes.json();
  console.log("[AI-Playlist] Add tracks response:", addTracksData);

  // --- Save playlist and tracks to DB ---
  try {
    // First, ensure user exists in DB
    console.log("[AI-Playlist] Ensuring user exists in DB:", session.user.id);
    const user = await prisma.user.upsert({
      where: { spotifyId: session.user.id },
      update: {
        name: session.user.name || null,
        email: session.user.email || "",
        accessToken: session.accessToken,
      },
      create: {
        id: session.user.id,
        spotifyId: session.user.id,
        name: session.user.name || null,
        email: session.user.email || "",
        accessToken: session.accessToken,
        refreshToken: "", // We'll handle refresh token separately
      },
    });
    console.log("[AI-Playlist] User upserted:", user.id);

    // Now create the playlist
    console.log("[AI-Playlist] Creating playlist in DB");
    const dbPlaylist = await prisma.playlist.create({
      data: {
        name: playlistData.name,
        spotifyPlaylistId: playlistData.id,
        sentiment: mood || aiResult.mood || aiResult.theme || null,
        description: description || `Generated by Gemini AI: ${moodText}`,
        userId: user.id, // Use the user.id from the upserted user
        tracks: {
          create: foundTracks.map(track => ({
            spotifyId: track.id,
            name: track.name,
            artists: track.artists,
            albumName: track.albumName,
            duration: track.duration,
            preview_url: track.preview_url,
          }))
        }
      },
      include: { tracks: true }
    });
    console.log("[AI-Playlist] Playlist created in DB:", dbPlaylist.id);

    return NextResponse.json({
      playlist: {
        id: playlistData.id,
        dbPlaylistId: dbPlaylist.id,
        name: playlistData.name,
        url: playlistData.external_urls.spotify,
        tracks: foundTracks,
        mood: mood || aiResult.mood || aiResult.theme || null,
      },
      aiResult
    });

  } catch (err) {
    console.error("[AI-Playlist] Error saving playlist to DB:", err);
    // Still return the Spotify playlist even if DB save fails
    return NextResponse.json({
      playlist: {
        id: playlistData.id,
        name: playlistData.name,
        url: playlistData.external_urls.spotify,
        tracks: foundTracks,
        mood: mood || aiResult.mood || aiResult.theme || null,
      },
      aiResult,
      dbError: "Failed to save to database, but playlist was created on Spotify"
    });
  }
}
