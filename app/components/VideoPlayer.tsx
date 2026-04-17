"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src?: string; // master.m3u8 URL
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    // Pause all other videos on the page
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((v) => {
      if (v !== videoRef.current) v.pause();
    });

    let hls: Hls | null = null;

    if (Hls.isSupported() && src.endsWith(".m3u8")) {
      hls = new Hls({
        // Optional: tweak buffer settings for smoother playback
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: true,
      });

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      // Auto-play when manifest is loaded
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Pick the first quality (usually lowest) automatically
        hls!.currentLevel = -1;
        videoRef.current!.play().catch(() => {
          // Autoplay may fail in some browsers, muted helps
          videoRef.current!.muted = true;
          videoRef.current!.play();
        });
      });

      // // Optional: log errors for debugging
      // hls.on(Hls.Events.ERROR, (event, data) => {
      //   console.error("HLS error:", data);
      // });
    } else {
      // Fallback: native browser support (Safari)
      videoRef.current.src = src;
      videoRef.current.play().catch(() => {
        videoRef.current!.muted = true;
        videoRef.current!.play();
      });
    }

    return () => {
      hls?.destroy();
    };
  }, [src]);

  if (!src) return <div className="text-white p-4">No video selected</div>;

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-h-96 bg-black rounded"
      playsInline
      muted
    />
  );
};

export default VideoPlayer;
