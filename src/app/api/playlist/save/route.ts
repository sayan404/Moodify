import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log("[Save-Playlist] Start request");
    const session = await getServerSession(options) as Session;
    console.log("[Save-Playlist] Session:", session ? { user: session.user, accessToken: session.accessToken ? 'Present' : 'Missing' } : 'No session');
    if (!session?.user?.id || !session.accessToken) {
      console.log("[Save-Playlist] Unauthorized: missing user id or access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playlistId, dbPlaylistId, tracks } = await request.json();
    console.log("[Save-Playlist] Input:", { playlistId, dbPlaylistId, tracksCount: tracks?.length });
    if (!playlistId || !dbPlaylistId || !tracks) {
      console.log("[Save-Playlist] Missing playlistId or tracks");
      return NextResponse.json(
        { error: "Playlist ID and tracks are required" },
        { status: 400 }
      );
    }

    // Get playlist from database
    const playlist = await prisma.playlist.findUnique({
      where: { id: dbPlaylistId },
    });
    console.log("[Save-Playlist] Playlist from DB:", playlist);

    if (!playlist) {
      console.log("[Save-Playlist] Playlist not found in DB");
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Initialize Spotify API
    console.log("[Save-Playlist] Initializing Spotify API");
    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      {
        access_token: session.accessToken,
        token_type: "Bearer",
        expires_in: 3600000,
        refresh_token: "",
      }
    );

    // Create playlist on Spotify
    console.log("[Save-Playlist] Creating playlist on Spotify for user:", session.user.id);
    const spotifyPlaylist = await spotify.playlists.createPlaylist(
      session.user.id,
      {
        name: playlist.name,
        description: `Generated based on mood: ${playlist.sentiment}`,
        public: false,
      }
    );
    console.log("[Save-Playlist] Created Spotify playlist:", spotifyPlaylist);

    // Add tracks to the playlist
    if (tracks.length > 0) {
      console.log("[Save-Playlist] Adding tracks to Spotify playlist:", tracks.map((track: { id: string }) => track.id));
      await spotify.playlists.addItemsToPlaylist(
        spotifyPlaylist.id,
        tracks.map((track: { id: string }) => `spotify:track:${track.id}`)
      );
      console.log("[Save-Playlist] Tracks added to Spotify playlist");
    } else {
      console.log("[Save-Playlist] No tracks to add to Spotify playlist");
    }

    // Update playlist in database with Spotify ID
    await prisma.playlist.update({
      where: { id: dbPlaylistId },
      data: { spotifyPlaylistId: spotifyPlaylist.id },
    });
    console.log("[Save-Playlist] Updated playlist in DB with Spotify playlist ID");

    return NextResponse.json({
      success: true,
      spotifyPlaylistId: spotifyPlaylist.id,
    });
  } catch (error) {
    console.error("[Save-Playlist] Error saving playlist to Spotify:", error);
    return NextResponse.json(
      { error: "Failed to save playlist to Spotify" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const prisma = new PrismaClient();
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine");
    let playlists;
    if (mine === "true") {
      const session = await getServerSession(options) as Session;
      if (!session?.user?.id) {
        return NextResponse.json({ playlists: [] });
      }
      playlists = await prisma.playlist.findMany({
        where: { userId: session.user.id },
        include: {
          tracks: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      playlists = await prisma.playlist.findMany({
        include: {
          tracks: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("[Save-Playlist] Error fetching playlists:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
} 