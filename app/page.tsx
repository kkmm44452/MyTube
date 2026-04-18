// "use client";

// import { useEffect, useState } from "react";
// import VideoPlayer from "./components/VideoPlayer";

// interface Video {
//   id: string;
//   title: string;
//   description?: string;
//   channel?: string;
//   masterUrl: string;
//   thumbnail?: string;
//   views?: number;
//   likes?: number;
//   comments?: number;
// }

// export default function Home() {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [activeVideo, setActiveVideo] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchVideos() {
//       const res = await fetch("/api/videos");
//       const data = await res.json();

//       const videosArray = Array.isArray(data)
//         ? data
//         : data.videos || [];

//       // 🔥 STEP 1: build base list first
//       const baseVideos = videosArray.map((video: any) => ({
//         id: video.id,
//         title: video.title,
//         description: video.description,
//         channel: "My Channel",
//         filename: video.filename,
//         thumbnail:
//           video.thumbnail ||
//           `https://d3ad2g8hyy43zt.cloudfront.net${video.filename.replace(
//             "master.m3u8",
//             ""
//           )}thumbnail.jpg`,
//         views: video.views,
//         likes: video.likes || 0,
//         comments: video.comments || 0,
//         masterUrl: "", // will fill later
//       }));

//       // 🔥 STEP 2: fetch signed URLs
//       const withSignedUrls = await Promise.all(
//         baseVideos.map(async (video: any) => {
//           const res = await fetch(
//             `/api/cloudfront-signedurl?video=${video.filename.replace(
//               "master.m3u8",
//               ""
//             )}`
//           );

//           const data = await res.json();

//           return {
//             ...video,
//             masterUrl: data.url, // ✅ SIGNED URL HERE
//           };
//         })
//       );

//       setVideos(withSignedUrls);
//     }

//     fetchVideos();
//   }, []);

//   return (
//     <div className="bg-black min-h-screen text-white">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3 sm:p-4">
//         {videos.map((video) => (
//           <div
//             key={video.id}
//             className="bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 hover:scale-[1.02]"
//           >
//             {/* Thumbnail / Player */}
//             <div className="relative w-full aspect-video bg-black">
//               {activeVideo === video.id ? (
//                 <VideoPlayer src={video.masterUrl} />
//               ) : (
//                 <div
//                   className="w-full h-full cursor-pointer group"
//                   onClick={() => setActiveVideo(video.id)}
//                 >
//                   <img
//                     src={video.thumbnail || "/default-thumbnail.jpg"}
//                     alt={video.title}
//                     className="w-full h-full object-cover group-hover:opacity-80 transition"
//                     loading="lazy"
//                   />

//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="bg-black/60 rounded-full p-4 text-white text-xl">
//                       ▶
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Info */}
//             <div className="p-3 space-y-2">
//               <h2 className="text-sm font-semibold line-clamp-2">
//                 {video.title}
//               </h2>

//               <p className="text-xs text-gray-400 line-clamp-2">
//                 {video.description || "No description available"}
//               </p>

//               <p className="text-xs text-gray-500">{video.channel}</p>

//               <div className="flex justify-between text-xs text-gray-400 pt-1">
//                 <span>👁 {video.views || 0}</span>
//                 <span>👍 {video.likes}</span>
//                 <span>💬 {video.comments}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";

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

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // 🔐 STEP 1: initialize CloudFront cookies once
  async function initCloudFrontCookies() {
    await fetch("/api/cloudfront-cookies", {
      credentials: "include",
    });
  }

  useEffect(() => {
    async function fetchVideos() {
      // 🔐 FIRST: set cookies
      await initCloudFrontCookies();

      const res = await fetch("/api/videos");
      const data = await res.json();

      const videosArray = Array.isArray(data)
        ? data
        : data.videos || [];

      // 🔥 NO SIGNED URL ANYMORE — use direct CloudFront URL
      const formattedVideos = videosArray.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        channel: "My Channel",
        filename: video.filename,

        thumbnail:
          video.thumbnail ||
          `https://d3ad2g8hyy43zt.cloudfront.net${video.filename.replace(
            "master.m3u8",
            ""
          )}thumbnail.jpg`,

        views: video.views,
        likes: video.likes || 0,
        comments: video.comments || 0,

        // ✅ DIRECT URL (cookies will protect access)
        masterUrl: `https://d3ad2g8hyy43zt.cloudfront.net${video.filename}`,
      }));

      setVideos(formattedVideos);
    }

    fetchVideos();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3 sm:p-4">
        {videos.map((video) => (
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
              <h2 className="text-sm font-semibold line-clamp-2">
                {video.title}
              </h2>

              <p className="text-xs text-gray-400 line-clamp-2">
                {video.description || "No description available"}
              </p>

              <p className="text-xs text-gray-500">{video.channel}</p>

              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>👁 {video.views || 0}</span>
                <span>👍 {video.likes}</span>
                <span>💬 {video.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}