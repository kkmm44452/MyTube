// "use client";

// import React, { useEffect, useRef } from "react";
// import Hls from "hls.js";

// interface VideoPlayerProps {
//   src?: string; // master.m3u8 URL
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (!src) return;

//     const video = videoRef.current;
//     if (!video) return;

//     let hls: Hls | null = null;

//     const initPlayer = async () => {
//       try {
//         // 1. Get signed cookies FIRST
//         await fetch("/api/cloudfront-cookie", {
//           credentials: "include",
//         });

//         // 2. Pause other videos
//         document.querySelectorAll("video").forEach((v) => {
//           if (v !== video) v.pause();
//         });

//         // 3. HLS playback
//         if (Hls.isSupported() && src.endsWith(".m3u8")) {
//           hls = new Hls({
//             maxBufferLength: 30,
//             maxMaxBufferLength: 60,
//             capLevelToPlayerSize: true,
//             // 🔥 THIS IS REQUIRED FOR COOKIES
//     xhrSetup: (xhr) => {
//       xhr.withCredentials = true;
//     },
    
//           });

//           hls.config.xhrSetup = (xhr) => {
//   xhr.withCredentials = true;
// };
//           hls.loadSource(src);
//           hls.attachMedia(video as HTMLMediaElement); // ✅ FIXED TYPE ISSUE

//           hls.on(Hls.Events.MANIFEST_PARSED, () => {
//             hls!.currentLevel = -1;

//             video.play().catch(() => {
//               video.muted = true;
//               video.play();
//             });
//           });
//         } else {
//           // Safari fallback
//           video.src = src;

//           video.play().catch(() => {
//             video.muted = true;
//             video.play();
//           });
//         }
//       } catch (err) {
//         console.error("Video init error:", err);
//       }
//     };

//     initPlayer();

//     return () => {
//       hls?.destroy();
//     };
//   }, [src]);

//   if (!src) {
//     return <div className="text-white p-4">No video selected</div>;
//   }

//   return (
//     <video
//       ref={videoRef}
//       controls
//       className="w-full max-h-96 bg-black rounded"
//       playsInline
//       muted
//     />
//   );
// };

// export default VideoPlayer;

// "use client";

// import React, { useEffect, useRef } from "react";
// import Hls from "hls.js";

// interface VideoPlayerProps {
//   src?: string;
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (!src) return;

//     const video = videoRef.current;
//     if (!video) return;

//     let hls: Hls | null = null;

//     // pause other videos
//     document.querySelectorAll("video").forEach((v) => {
//       if (v !== video) v.pause();
//     });

//     if (Hls.isSupported() && src.endsWith(".m3u8")) {
//       hls = new Hls({
//         maxBufferLength: 30,
//         maxMaxBufferLength: 60,
//         capLevelToPlayerSize: true,
//         xhrSetup: (xhr) => {
//           xhr.withCredentials = true; // required for cookies
//         },
//       });

//       hls.loadSource(src);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         video.play().catch(() => {
//           video.muted = true;
//           video.play();
//         });
//       });
//     } else {
//       video.src = src;

//       video.play().catch(() => {
//         video.muted = true;
//         video.play();
//       });
//     }

//     return () => {
//       hls?.destroy();
//     };
//   }, [src]);

//   if (!src) {
//     return <div className="text-white p-4">No video selected</div>;
//   }

//   return (
//     <video
//       ref={videoRef}
//       controls
//       className="w-full max-h-96 bg-black rounded"
//       playsInline
//       muted
//     />
//   );
// };

// export default VideoPlayer;
"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoPath?: string; // full .m3u8 URL
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);

  // 1. Only ensure cookies are set (NOT fetching URL)
  useEffect(() => {
    if (!videoPath) return;

    const setupCookies = async () => {
      try {
        setLoading(true);

        // optional: only needed if your backend issues cookies per video
        await fetch(`/api/cloudfront-cookie`, {
          credentials: "include",
        });
      } catch (err) {
        console.error("Cookie setup failed:", err);
      } finally {
        setLoading(false);
      }
    };

    setupCookies();
  }, [videoPath]);

  // 2. Play video using direct .m3u8 URL
  useEffect(() => {
    if (!videoPath) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // pause other videos
    document.querySelectorAll("video").forEach((v) => {
      if (v !== video) v.pause();
    });

    if (Hls.isSupported() && videoPath.includes(".m3u8")) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true; // 🔥 REQUIRED for signed cookies
        },
      });

      hls.loadSource(videoPath); // 👈 DIRECT URL
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      });
    } else {
      video.src = videoPath;

      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }

    return () => {
      hls?.destroy();
    };
  }, [videoPath]);

  if (!videoPath) {
    return <div className="text-white p-4">No video selected</div>;
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="text-white p-2">Preparing secure access...</div>
      )}

      <video
        ref={videoRef}
        controls
        className="w-full max-h-96 bg-black rounded"
        playsInline
        muted
      />
    </div>
  );
};

export default VideoPlayer;