import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const video = searchParams.get("video");

  if (!video) {
    return NextResponse.json({ error: "Missing video" }, { status: 400 });
  }

  const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const playlistUrl = `${baseUrl}${video}`;

  // 🔥 fetch original playlist
  const res = await fetch(playlistUrl);
  let playlist = await res.text();

  // 🔥 rewrite segments → signed URLs
  playlist = playlist
    .split("\n")
    .map((line) => {
      if (line.startsWith("#") || line.trim() === "") return line;

      if (line.includes(".ts")) {
        const fullUrl = `${baseUrl}${video.replace("master.m3u8", "")}${line}`;

        const signed = getSignedUrl({
          url: fullUrl,
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
    },
  });
}