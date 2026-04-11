import { NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId required" },
        { status: 400 }
      );
    }

    // 🔥 update status
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "UPLOADED",
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}