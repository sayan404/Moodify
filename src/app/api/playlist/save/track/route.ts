import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { options } from "../../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(options) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { dbPlaylistId, trackId } = await request.json();
    if (!dbPlaylistId || !trackId) {
      return NextResponse.json({ error: "Playlist ID and Track ID required" }, { status: 400 });
    }
    // Ensure the playlist belongs to the user
    const playlist = await prisma.playlist.findUnique({
      where: { id: dbPlaylistId },
    });
    if (!playlist || playlist.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 403 });
    }
    await prisma.track.delete({ where: { id: trackId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete-Track] Error deleting track:", error);
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 });
  }
}
