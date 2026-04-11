// // app/api/upload/route.ts (Next.js 13+ App Router)
// import { NextRequest, NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { filename, type } = body;

//     if (!filename || !type) {
//       return NextResponse.json({ error: "Missing filename or type" }, { status: 400 });
//     }

//     const key = `raw/${Date.now()}-${filename}`;

//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_BUCKET!,
//       Key: key,
//       ContentType: type,
//     });

//     const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

//     return NextResponse.json({ url, key });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
//   }
// }

// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/prisma/lib/prisma";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      filename,
      type,
      userId,
    }: {
      filename: string;
      type: string;
      userId: string;
    } = body;

    // 1. Validation
    if (!filename || !type || !userId) {
      return NextResponse.json(
        { error: "filename, type, userId are required" },
        { status: 400 }
      );
    }

    // 2. Generate unique file name
    const uuid = crypto.randomUUID();
    const cleanName = filename.replace(/\s+/g, "-").toLowerCase();
    const baseName = `${uuid}-${cleanName}`;

    // 3. S3 key (RAW upload path)
    const key = `raw/${baseName}`;

    // 4. Create presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      ContentType: type,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 60, // 1 hour
    });

    // 5. HLS output path (used later by Lambda / transcoder)
    const hlsPath = `hls/${baseName}/master.m3u8`;

    // 6. Save to database
    const video = await prisma.video.create({
      data: {
        userId,
        title: filename,
        filename: baseName,
        key,
        hlsPath,
      },
    });

    // 7. Response
    return NextResponse.json({
      uploadUrl,
      videoId: video.id,
      key,
      hlsPath,
      baseName,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}