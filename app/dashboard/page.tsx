"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import VideoPlayer from "@/app/components/VideoPlayer";
import UploadVideoForm from "@/app/components/UploadVideoForm";

interface Video {
  id: string;
  title: string;
  description?: string;
  channel?: string;
  masterUrl: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
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

//      const formatted = videosArray.map((video: any) => ({
//   id: video.id,
//   title: video.title,
//   description: video.description,
//   channel: "My Channel",
//   thumbnail:
//     video.thumbnail ||
//     `https://d3ad2g8hyy43zt.cloudfront.net${video.filename.replace(
//       "master.m3u8",
//       ""
//     )}thumbnail.jpg`,
//   views: video.views || 0,
//   likes: video.likes || 0,
//   comments: video.comments || 0,
//   masterUrl: `https://d3ad2g8hyy43zt.cloudfront.net${video.filename}`,
// }));

const formatted = await Promise.all(
  videosArray.map(async (video: any) => {
    const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

    // 🔥 build thumbnail URL
    const thumbUrl =
      video.thumbnail ||
      `${baseUrl}${video.filename.replace("master.m3u8", "thumbnail.jpg")}`;

    // 🔐 get signed thumbnail URL
    const thumbRes = await fetch(
      `/api/cloudfront-signedurl?video=${encodeURIComponent(thumbUrl)}`
    );
    const { url: signedThumbnail } = await thumbRes.json();

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      channel: "My Channel",

      thumbnail: signedThumbnail, // ✅ signed thumbnail

      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,

      // 🎥 keep video via cookies OR direct
      masterUrl: `${baseUrl}${video.filename}`,
    };
  })
);

setVideos(formatted);

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
              <div className="w-full relative pb">
                {activeVideo === video.id ? (
  <VideoPlayer videoPath={`/api/cloudfront-playlist?video=${encodeURIComponent( video.masterUrl )}`} />
) : (
  <div
    className="w-full h-full cursor-pointer group"
    onClick={() => setActiveVideo(video.id)}
  >
    <img
      src={video.thumbnail || "/default-thumbnail.jpg"}
      alt={video.title}
      className="w-full h-full object-cover group-hover:opacity-80 transition"
      loading="lazy"
    />

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-black/60 rounded-full p-3 text-white">
        ▶
      </div>
    </div>
  </div>
)}
              </div>

         <div className="p-3 space-y-1">
  <h2 className="text-sm font-semibold line-clamp-2">
    {video.title}
  </h2>

  <p className="text-xs text-gray-400 line-clamp-2">
    {video.description || "No description available"}
  </p>

  <p className="text-xs text-gray-500">
    {video.channel}
  </p>

  <div className="flex justify-between text-xs text-gray-400 pt-1">
    <span>👁 {video.views || 0}</span>
    <span>👍 {video.likes || 0}</span>
    <span>💬 {video.comments || 0}</span>
  </div>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
