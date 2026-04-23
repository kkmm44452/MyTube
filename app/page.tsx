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

  // 🔐 STEP 1: initialize CloudFront cookies once its just in case not in use only be in the code to checking for the server side cookies generations. not imp for the code flows only for testing
  async function initCloudFrontCookies() {
    await fetch("/api/cloudfront-cookie", {
      credentials: "include",
    });
  }

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch("/api/videos");
      const data = await res.json();

      const videosArray = Array.isArray(data)
        ? data
        : data.videos || [];

      // 🔥 STEP 1: build base list first
      const baseVideos = videosArray.map((video: any) => ({
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
        masterUrl: "", // will fill later
      }));

      // 🔥 STEP 2: fetch signed URLs
      const withSignedUrls = await Promise.all(
  baseVideos.map(async (video: any) => {
    const res = await fetch(
      `/api/cloudfront-signedurl?video=https://d3ad2g8hyy43zt.cloudfront.net${video.filename}`
    );

          const data = await res.json();
const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

    // 🔐 SIGN THUMBNAIL
    const thumbUrl =
      video.thumbnail ||
      `${baseUrl}${video.filename.replace("master.m3u8", "thumbnail.jpg")}`;

    const thumbRes = await fetch(
      `/api/cloudfront-signedurl?video=${encodeURIComponent(thumbUrl)}`
    );

    const thumbData = await thumbRes.json();
          return {
            ...video,
            thumbnail: thumbData.url, // ✅ signed thumbnail
            masterUrl: data.url, // ✅ USE SIGNED URL HERE
          };
        })
      );

      setVideos(withSignedUrls);
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
              //<VideoPlayer videoPath={`/api/cloudfront-playlist?video=${encodeURIComponent( video.masterUrl )}`} />
               <VideoPlayer videoPath={ video.masterUrl } />

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

//   // 🔐 STEP 1: initialize CloudFront cookies once
//   async function initCloudFrontCookies() {
//     await fetch("/api/cloudfront-cookie", {
//       credentials: "include",
//     });
//   }

//   useEffect(() => {
//     async function fetchVideos() {
//       // 🔐 FIRST: set cookies
//       await initCloudFrontCookies();

//       const res = await fetch("/api/videos");
//       const data = await res.json();

//       const videosArray = Array.isArray(data)
//         ? data
//         : data.videos || [];

//       // // 🔥 NO SIGNED URL ANYMORE — use direct CloudFront URL
//       // const formattedVideos = videosArray.map((video: any) => ({
//       //   id: video.id,
//       //   title: video.title,
//       //   description: video.description,
//       //   channel: "My Channel",
//       //   filename: video.filename,

//       //   thumbnail:
//       //     video.thumbnail ||
//       //     `https://d3ad2g8hyy43zt.cloudfront.net${video.filename.replace(
//       //       "master.m3u8",
//       //       ""
//       //     )}thumbnail.jpg`,

//       //   views: video.views,
//       //   likes: video.likes || 0,
//       //   comments: video.comments || 0,

//       //   // ✅ DIRECT URL (cookies will protect access)
//       //   masterUrl: `https://d3ad2g8hyy43zt.cloudfront.net${video.filename}`,
//       // }));
// const formattedVideos = await Promise.all(
//   videosArray.map(async (video: any) => {
//     const baseUrl = "https://d3ad2g8hyy43zt.cloudfront.net";

//     const thumbUrl =
//       video.thumbnail ||
//       `${baseUrl}${video.filename.replace("master.m3u8", "thumbnail.jpg")}`;

//     // 🔐 SIGN THUMBNAIL
//     const thumbRes = await fetch(
//       `/api/cloudfront-signedurl?video=${encodeURIComponent(thumbUrl)}`
//     );
//     const { url: signedThumbnail } = await thumbRes.json();

//     return {
//       id: video.id,
//       title: video.title,
//       description: video.description,
//       channel: "My Channel",
//       filename: video.filename,

//       thumbnail: signedThumbnail, // ✅ SIGNED

//       views: video.views,
//       likes: video.likes || 0,
//       comments: video.comments || 0,

//       // ✅ still using cookies for video
//       masterUrl: `${baseUrl}${video.filename}`,
//     };
//   })
// );
//       setVideos(formattedVideos);
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
//               //  <VideoPlayer videoPath={video.masterUrl} />
//               // <VideoPlayer videoPath={`/api/cloudfront-playlist?video=${video.masterUrl}`} />

              

// <VideoPlayer
//   videoPath={`/api/cloudfront-playlist?video=${encodeURIComponent(
//     video.masterUrl.replace("https://d3ad2g8hyy43zt.cloudfront.net", "")
//   )}`}
// />

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