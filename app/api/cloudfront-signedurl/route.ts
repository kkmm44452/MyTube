import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const video = searchParams.get("video");

    if (!video) {
      return NextResponse.json(
        { error: "Missing video param" },
        { status: 400 }
      );
    }

    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

    // ✅ Fix: ensure env vars exist
    if (!keyPairId || !privateKey) {
      return NextResponse.json(
        { error: "Missing CloudFront env variables" },
        { status: 500 }
      );
    }

    const resourceUrl = `https://d3ad2g8hyy43zt.cloudfront.net${video}master.m3u8`;

    const signedUrl = getSignedUrl({
      url: resourceUrl,
      keyPairId: keyPairId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });

    return NextResponse.json({ url: signedUrl });
  } catch (err: unknown) {
    // ✅ Fix unknown error type
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}