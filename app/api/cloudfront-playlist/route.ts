// import { NextRequest, NextResponse } from "next/server";
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

// const BASE = "https://d3ad2g8hyy43zt.cloudfront.net";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     let video = searchParams.get("video");

//     if (!video) {
//       return NextResponse.json({ error: "Missing video" }, { status: 400 });
//     }

//     // 🔥 FIX: remove full CloudFront URL if passed
//     video = video.replace(BASE, "");

//     if (!video.startsWith("/")) {
//       video = "/" + video;
//     }

//     const playlistUrl = `${BASE}${video}`;

//     // 🔥 fetch original m3u8
//     const res = await fetch(playlistUrl);

//     if (!res.ok) {
//       return NextResponse.json(
//         { error: "Failed to fetch playlist", status: res.status },
//         { status: 500 }
//       );
//     }

//     let playlist = await res.text();

//     const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
//     const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

//     const folder = video.replace("master.m3u8", "");

//     // 🔥 rewrite playlist safely
//     playlist = playlist
//       .split("\n")
//       .map((line) => {
//         if (!line || line.startsWith("#")) return line;

//         if (line.includes(".ts")) {
//           const fileUrl = `${BASE}${folder}${line}`;

//           const signed = getSignedUrl({
//             url: fileUrl,
//             keyPairId,
//             privateKey,
//             dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
//           });

//           return signed;
//         }

//         return line;
//       })
//       .join("\n");

//     return new NextResponse(playlist, {
//       headers: {
//         "Content-Type": "application/vnd.apple.mpegurl",
//         "Cache-Control": "no-cache",
//       },
//     });

//   } catch (err: any) {
//     console.error("PLAYLIST ERROR:", err);

//     return NextResponse.json(
//       { error: err.message || "Internal error" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

// const BASE = "https://d3ad2g8hyy43zt.cloudfront.net";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     let video = searchParams.get("video");

//     if (!video) {
//       return NextResponse.json({ error: "Missing video" }, { status: 400 });
//     }

//     // 🔥 normalize input
//     video = decodeURIComponent(video);
//     video = video.replace(BASE, "");
//     if (!video.startsWith("/")) video = "/" + video;

//     const playlistUrl = `${BASE}${video}`;

//     const res = await fetch(playlistUrl);

//     if (!res.ok) {
//       return NextResponse.json(
//         { error: "Failed to fetch playlist", status: res.status },
//         { status: 500 }
//       );
//     }

//     let playlist = await res.text();

//     const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
//     const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

//     // 🔥 extract base folder safely
//     const folder = video.split("master.m3u8")[0];

//     playlist = playlist
//       .split("\n")
//       .map((line) => {
//         const trimmed = line.trim();

//         if (!trimmed || trimmed.startsWith("#")) return line;

//         if (trimmed.includes(".ts")) {
//           // 🔥 normalize segment path
//           const segmentPath = trimmed.startsWith("/")
//             ? trimmed
//             : `${folder}${trimmed}`;

//           const fileUrl = `${BASE}${segmentPath}`;

//           const signed = getSignedUrl({
//             url: fileUrl,
//             keyPairId,
//             privateKey,
//             dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
//           });

//           return signed;
//         }

//         return line;
//       })
//       .join("\n");

//     return new NextResponse(playlist, {
//       headers: {
//         "Content-Type": "application/vnd.apple.mpegurl",
//         "Cache-Control": "no-cache",
//       },
//     });

//   } catch (err: any) {
//     console.error("PLAYLIST ERROR:", err);

//     return NextResponse.json(
//       { error: err.message || "Internal error" },
//       { status: 500 }
//     );
//   }
// }


// import { NextRequest, NextResponse } from "next/server";
// import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

// const BASE = "https://d3ad2g8hyy43zt.cloudfront.net";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     let video = searchParams.get("video");

//     if (!video) {
//       return NextResponse.json({ error: "Missing video" }, { status: 400 });
//     }

//     video = decodeURIComponent(video);
//     if (!video.startsWith("/")) video = "/" + video;

//     const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
//     const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

//     const url = `${BASE}${video}`;

//     // =========================
//     // 🔥 STEP 1: SIGN MASTER (INTERNAL ONLY)
//     // =========================
//     const signedMasterUrl = getSignedUrl({
//       url,
//       keyPairId,
//       privateKey,
//       dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
//     });

//     // fetch master securely
//     const res = await fetch(signedMasterUrl);

//     if (!res.ok) {
//       return NextResponse.json(
//         { error: "Failed to fetch playlist", status: res.status },
//         { status: 500 }
//       );
//     }

//     let playlist = await res.text();

//     const isMaster = playlist.includes("#EXT-X-STREAM-INF");
//     const basePath = video.substring(0, video.lastIndexOf("/") + 1);

//     playlist = playlist
//       .split("\n")
//       .map((line) => {
//         const trimmed = line.trim();

//         if (!trimmed || trimmed.startsWith("#")) return line;

//         const filePath = trimmed.startsWith("/")
//           ? trimmed
//           : `${basePath}${trimmed}`;

//         const fileUrl = `${BASE}${filePath}`;

//         // =========================
//         // 🔥 MASTER → redirect to API (NOT CloudFront)
//         // =========================
//         if (isMaster && trimmed.endsWith(".m3u8")) {
//           return `/api/cloudfront-playlist?video=${encodeURIComponent(filePath)}`;
//         }

//         // =========================
//         // 🔥 INDEX → SIGN TS ONLY
//         // =========================
//         if (!isMaster && trimmed.match(/\.ts(\?|$)/)) {
//           return getSignedUrl({
//             url: fileUrl,
//             keyPairId,
//             privateKey,
//             dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
//           });
//         }

//         return line;
//       })
//       .join("\n");

//     return new NextResponse(playlist, {
//       headers: {
//         "Content-Type": "application/vnd.apple.m3u8",
//         "Cache-Control": "no-cache",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message || "Internal error" },
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
