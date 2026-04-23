// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const video = searchParams.get("video");

//     if (!video) {
//       return NextResponse.json(
//         { error: "Missing video param" },
//         { status: 400 }
//       );
//     }

//     const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
//     const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

//     // ✅ Fix: ensure env vars exist
//     if (!keyPairId || !privateKey) {
//       return NextResponse.json(
//         { error: "Missing CloudFront env variables" },
//         { status: 500 }
//       );
//     }

//     const resourceUrl = `https://d3ad2g8hyy43zt.cloudfront.net${video}master.m3u8`;

//     const signedUrl = getSignedUrl({
//       url: resourceUrl,
//       keyPairId: keyPairId,
//       privateKey: privateKey.replace(/\\n/g, "\n"),
//       dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
//     });

//     return NextResponse.json({ url: signedUrl });
//   } catch (err: unknown) {
//     // ✅ Fix unknown error type
//     const message = err instanceof Error ? err.message : "Unknown error";

//     return NextResponse.json(
//       { error: message },
//       { status: 500 }
//     );
//   }
// }
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const video = searchParams.get("video");

    console.log("\n==============================");
    console.log("👉 RAW INPUT VIDEO:", video);

    if (!video) {
      console.log("❌ Missing video param");
      return NextResponse.json({ error: "Missing video" }, { status: 400 });
    }

    const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

    // =========================
    // 🔥 STEP 1: NORMALIZE INPUT
    // =========================
    let cleanPath = video;

    console.log("👉 STEP 1 - Initial path:", cleanPath);

    // remove full domain if accidentally passed
    cleanPath = cleanPath.replace(baseUrl, "");

    console.log("👉 STEP 2 - After domain removal:", cleanPath);

    // ensure leading slash
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    console.log("👉 STEP 3 - Final clean path:", cleanPath);

    // =========================
    // 🔥 STEP 2: BUILD RESOURCE URL
    // =========================
    const resourceUrl = `${baseUrl}${cleanPath}`;

    console.log("👉 STEP 4 - Resource URL:", resourceUrl);

    // =========================
    // 🔥 STEP 3: CLOUD FRONT KEYS
    // =========================
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!;

    console.log("👉 KEYPAIR ID:", keyPairId ? "OK" : "MISSING");
    console.log("👉 PRIVATE KEY:", privateKey ? "OK" : "MISSING");

    // =========================
    // 🔥 STEP 4: SIGN URL (IMPORTANT FIX HERE)
    // =========================
    const signedUrl = getSignedUrl({
      url: resourceUrl, // ✅ FIXED (NOT `video`)
      keyPairId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });

    console.log("👉 STEP 5 - SIGNED URL:");
    console.log(signedUrl);

    console.log("==============================\n");

    const res = await fetch(signedUrl);

    if (!res.ok) {
      console.log("❌ Failed to fetch master:", res.status);
      return NextResponse.json(
        { error: "Failed to fetch master", status: res.status },
        { status: 500 }
      );
    }

    let playlist = await res.text();

    console.log("👉 MASTER FETCHED SUCCESSFULLY");

    const isMaster = playlist.includes("#EXT-X-STREAM-INF");
    const basePath = cleanPath.substring(0, cleanPath.lastIndexOf("/") + 1);

    // =========================
    // 🔥 REWRITE PLAYLIST
    // =========================
    playlist = playlist
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) return line;

        const filePath = trimmed.startsWith("/")
          ? trimmed
          : `${basePath}${trimmed}`;

        const fileUrl = `${baseUrl}${filePath}`;

        // =========================
        // 🔥 MASTER → redirect to API
        // =========================
        if (isMaster && trimmed.endsWith(".m3u8")) {
          return `/api/cloudfront-playlist?video=${encodeURIComponent(filePath)}`;
        }

        // =========================
        // 🔥 TS SIGNING
        // =========================
        if (!isMaster && trimmed.match(/\.ts(\?|$)/)) {
          return getSignedUrl({
            url: fileUrl,
            keyPairId,
            privateKey,
            dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
          });
        }

        return line;
      })
      .join("\n");

    console.log("👉 PLAYLIST REWRITTEN");

    // =========================
    // RESPONSE
    // =========================
    return new NextResponse(playlist, {
      headers: {
        "Content-Type": "application/vnd.apple.m3u8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err: any) {
    console.error("❌ ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
