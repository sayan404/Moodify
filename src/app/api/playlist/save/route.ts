import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playlistId } = await request.json();
    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    // Get playlist from database
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Initialize Spotify API
    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      session.accessToken as string
    );

    // Create playlist on Spotify
    const spotifyPlaylist = await spotify.playlists.createPlaylist(
      session.user.id,
      {
        name: playlist.name,
        description: `Generated based on mood: ${playlist.sentiment}`,
        public: false,
      }
    );

    // Add tracks to the playlist
    await spotify.playlists.addItemsToPlaylist(
      spotifyPlaylist.id,
      playlist.tracks.map((track) => `spotify:track:${track.id}`)
    );

    // Update playlist in database with Spotify ID
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { spotifyPlaylistId: spotifyPlaylist.id },
    });

    return NextResponse.json({
      success: true,
      spotifyPlaylistId: spotifyPlaylist.id,
    });
  } catch (error) {
    console.error("Error saving playlist to Spotify:", error);
    return NextResponse.json(
      { error: "Failed to save playlist to Spotify" },
      { status: 500 }
    );
  }
} 