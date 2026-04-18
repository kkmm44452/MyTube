// app/components/VideoClient.tsx
"use client";

import { useState } from "react";
import VideoPlayer from "./VideoPlayer";

export default function VideoClient({ videos }: any) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3 sm:p-4">
        {videos.map((video: any) => (
          <div key={video.id} className="bg-gray-900 rounded overflow-hidden shadow-lg">
            
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
}