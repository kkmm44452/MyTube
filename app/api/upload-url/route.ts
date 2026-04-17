// // /app/api/upload-url/route.ts
// export async function POST(req: Request) {
//   const body = await req.json(); // { filename, type }

//   const lambdaUrl = "https://asv7ndil3e4cupbdfmw6i4gih40ttjja.lambda-url.eu-north-1.on.aws/";

//   // Forward the POST request to Lambda
//   const lambdaRes = await fetch(lambdaUrl, {
//     method: "POST",
//     body: JSON.stringify(body), // pass filename & type
//     headers: { "Content-Type": "application/json" },
//   });

  
//   if (!lambdaRes.ok) {
//     const text = await lambdaRes.text();
//     console.error("Lambda error:", text);
//     throw new Error("Lambda call failed");
//   }

//   const data = await lambdaRes.json(); // { uploadURL, fileName }

//   return new Response(JSON.stringify(data), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

import { NextResponse } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export async function POST(req: Request) {
  try {
  const body: {
  filename: string;
  type: string;
  userId: string;
  title?: string;
  description?: string;
} = await req.json();
    const { filename, type, userId, title, description } = body;

    if (!filename || !type || !userId) {
      return NextResponse.json(
        { error: "filename, type, userId required" },
        { status: 400 }
      );
    }

    const uuid = crypto.randomUUID();

    const ext = filename.split(".").pop(); // mp4

    const baseName = filename
    .split(".")[0]
    .replace(/\s+/g, "-")
    .toLowerCase();

    const shortName = `${baseName}-${uuid.slice(0, 8)}.${ext}`;
    // 2. S3 KEY
    const key = `raw/${shortName}`;

    // 3. HLS PATH
    const hlsPath = `/hls/${baseName}-${uuid.slice(0, 8)}/master.m3u8`;

    // 4. SAVE IN DATABASE FIRST
    const video = await prisma.video.create({
      data: {
        userId,
          title: title || filename,          // ✅ fallback safe
          description: description || "",    // ✅ fallback safe
          filename: hlsPath,
          key,
          hlsPath,
        // status: "PENDING",
      },
    });

    // 5. SEND TO LAMBDA
    const lambdaUrl =
      "https://asv7ndil3e4cupbdfmw6i4gih40ttjja.lambda-url.eu-north-1.on.aws/";

    const lambdaRes = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: video.id,   // 👈 IMPORTANT
        filename: shortName,  // small sorted name
        type,
        key,
      }),
    });

    if (!lambdaRes.ok) {
      const err = await lambdaRes.text();

      // await prisma.video.update({
      //   where: { id: video.id },
      //   data: { status: "FAILED" },
      // });

      return NextResponse.json(
        { error: "Lambda failed", details: err },
        { status: 500 }
      );
    }

    const lambdaData = await lambdaRes.json();

    // 6. RETURN RESPONSE
    return NextResponse.json({
      videoId: video.id,
      uploadUrl: lambdaData.uploadURL,
      filename: shortName,
      key,
      hlsPath,
      // status: "PENDING",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
