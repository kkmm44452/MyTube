import { prisma } from "@/prisma/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");

  const videos = await prisma.video.findMany({
    where: {
      status: "UPLOADED",
      ...(userId && { userId }),
    },
  });

  return Response.json(videos);
}