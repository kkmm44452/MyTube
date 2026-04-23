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

    video = decodeURIComponent(video);
    if (!video.startsWith("/")) video = "/" + video;

    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n");

    const url = `${BASE}${video}`;

    // =========================
    // 🔥 STEP 1: SIGN MASTER (INTERNAL ONLY)
    // =========================
    const signedMasterUrl = getSignedUrl({
      url,
      keyPairId,
      privateKey,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });

    // fetch master securely
    const res = await fetch(signedMasterUrl);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch playlist", status: res.status },
        { status: 500 }
      );
    }

    let playlist = await res.text();

    const isMaster = playlist.includes("#EXT-X-STREAM-INF");
    const basePath = video.substring(0, video.lastIndexOf("/") + 1);

    playlist = playlist
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) return line;

        const filePath = trimmed.startsWith("/")
          ? trimmed
          : `${basePath}${trimmed}`;

        const fileUrl = `${BASE}${filePath}`;

        // =========================
        // 🔥 MASTER → redirect to API (NOT CloudFront)
        // =========================
        if (isMaster && trimmed.endsWith(".m3u8")) {
          return `/api/cloudfront-playlist?video=${encodeURIComponent(filePath)}`;
        }

        // =========================
        // 🔥 INDEX → SIGN TS ONLY
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

    return new NextResponse(playlist, {
      headers: {
        "Content-Type": "application/vnd.apple.m3u8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}