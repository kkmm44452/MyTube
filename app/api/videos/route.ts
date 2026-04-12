import { prisma } from "@/prisma/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        status: "COMPLETED",
      },
    });

    return Response.json(videos);
  } catch (error) {
     
  console.error("FULL ERROR:", error);
  console.error("DB URL exists:", process.env.DATABASE_URL);

    console.error("VIDEOS API ERROR:", error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch videos" }),
      { status: 500 }
    );
  }
}