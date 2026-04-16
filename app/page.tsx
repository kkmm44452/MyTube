"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
// import VideoThumbnail from "./components/VideoThumbnail";

// ✅ TypeScript interface for videos
interface Video {
  id: string;
  title: string;
  channel?: string;
  masterUrl: string;
}


export default function Home() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    useEffect(() => {
    async function fetchVideos() {
      const res = await fetch("/api/videos");
      const data = await res.json();

      //console.log(data);  for testing purpose

     if (!data) return;

const videosArray = Array.isArray(data)
  ? data
  : data.videos || [];

if (!Array.isArray(videosArray)) {
  console.error("Invalid API response:", data);
  return;
}

const formattedVideos = videosArray.map((video: any) => ({
  id: video.id,
  title: video.title,
  channel: "My Channel",
  masterUrl: `https://d3ad2g8hyy43zt.cloudfront.net${video.filename}`,
}));

setVideos(formattedVideos);
    }

    fetchVideos();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3 sm:p-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-gray-900 rounded overflow-hidden shadow-lg"
          >
            {/* Video player or thumbnail */}
            <div className="w-full relative pb-[56.25%]">
              {activeVideo === video.id ? (
                <VideoPlayer src={video.masterUrl} />
              ) : (
                <div
                  className="cursor-pointer absolute top-0 left-0 w-full h-full"
                  onClick={() => setActiveVideo(video.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-30 rounded-full p-3">
                      ▶
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video info */}
            <div className="p-2 sm:p-3">
              <h2 className="text-sm sm:text-base font-semibold">
                {video.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                {video.channel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

<div
  key={video.id}
  className="bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 hover:scale-[1.02]"
>
  {/* Thumbnail / Player */}
  <div className="relative w-full aspect-video bg-black">
    {activeVideo === video.id ? (
      <VideoPlayer src={video.masterUrl} />
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

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-full p-4 text-white text-xl">
            ▶
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Info */}
  <div className="p-3 space-y-2">
    {/* Title */}
    <h2 className="text-sm sm:text-base font-semibold line-clamp-2">
      {video.title}
    </h2>

    {/* Description (clamped) */}
    <p className="text-xs text-gray-400 line-clamp-2">
      {video.description || "No description available"}
    </p>

    {/* Channel */}
    <p className="text-xs text-gray-500">
      {video.channel}
    </p>

    {/* Stats */}
    <div className="flex justify-between text-xs text-gray-400 pt-1">
      <span>👁 {video.views || 0}</span>
      <span>👍 {video.likes}</span>
      <span>💬 {video.comments}</span>
    </div>
  </div>
</div>


















  
}
