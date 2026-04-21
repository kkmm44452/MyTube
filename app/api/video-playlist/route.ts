import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let video = searchParams.get("video");

  if (!video) {
    return NextResponse.json({ error: "Missing video" }, { status: 400 });
  }

  const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

  // 🔥 normalize FULL URL → PATH ONLY
  video = video.replace(baseUrl, "");
  if (!video.startsWith("/")) video = "/" + video;

  // ✅ return CLEAN PLAYLIST URL (frontend never touches cloudfront)
  const playlistUrl = `/api/cloudfront-playlist?video=${encodeURIComponent(video)}`;

  return NextResponse.json({
    playlistUrl,
  });
}