import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const BASE = "https://d3ad2g8hyy43zt.cloudfront.net";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let video = searchParams.get("video");

    if (!video) {
      return NextResponse.json({ error: "Missing video" }, { status: 400 });
    }

    // 🔥 FIX: remove full CloudFront URL if passed
    video = video.replace(BASE, "");

    if (!video.startsWith("/")) {
      video = "/" + video;
    }

    const playlistUrl = `${BASE}${video}`;

    // 🔥 fetch original m3u8
    const res = await fetch(playlistUrl);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch playlist", status: res.status },
        { status: 500 }
      );
    }

    let playlist = await res.text();

    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

    const folder = video.replace("master.m3u8", "");

    // 🔥 rewrite playlist safely
    playlist = playlist
      .split("\n")
      .map((line) => {
        if (!line || line.startsWith("#")) return line;

        if (line.includes(".ts")) {
          const fileUrl = `${BASE}${folder}${line}`;

          const signed = getSignedUrl({
            url: fileUrl,
            keyPairId,
            privateKey,
            dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
          });

          return signed;
        }

        return line;
      })
      .join("\n");

    return new NextResponse(playlist, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      },
    });

  } catch (err: any) {
    console.error("PLAYLIST ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}