"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import VideoPlayer from "@/app/components/VideoPlayer";
import UploadVideoForm from "@/app/components/UploadVideoForm";

interface Video {
  id: string;
  title: string;
  channel?: string;
  masterUrl: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (!user?.userId) return;

        setLoading(true);
        setError(null);

        const res = await fetch(`/api/user-videos?userId=${user.userId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await res.json();

        const videosArray = Array.isArray(data)
          ? data
          : data?.data ?? [];

        const formatted = videosArray.map((video: any) => ({
          id: video.id,
          title: video.title,
          channel: "My Channel",
          masterUrl: `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}${video.filename}`,
        }));

        setVideos(formatted);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user?.userId]);

  if (!user) return <p>Please login to see videos</p>;
  if (loading) return <p>Loading videos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-black min-h-screen text-white p-4">
      <h1 className="text-2xl mb-4">Welcome to Dashboard 🎉</h1>

      <UploadVideoForm />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-900 rounded overflow-hidden shadow-lg"
            >
              <div className="w-full relative pb-[56.25%]">
                {activeVideo === video.id ? (
                  <VideoPlayer src={video.masterUrl} />
                ) : (
                  <div
                    className="cursor-pointer absolute inset-0 flex items-center justify-center"
                    onClick={() => setActiveVideo(video.id)}
                  >
                    <div className="bg-white bg-opacity-30 rounded-full p-3">
                      ▶
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2">
                <h2 className="text-sm font-semibold">{video.title}</h2>
                <p className="text-xs text-gray-400">{video.channel}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}