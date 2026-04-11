import { prisma } from "@/prisma/lib/prisma";

export async function GET() {
  const videos = await prisma.video.findMany({
    where: {
      status: "COMPLETED",
    },
  });

  return Response.json(videos);
}