"use client";

import { useEffect, useState } from "react";
import Hls from "hls.js";

interface VideoThumbnailProps {
  src: string;
}

export default function VideoThumbnail({ src }: VideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.crossOrigin = "anonymous";
    video.playsInline = true;

    let hls: Hls | null = null;

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 180;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL("image/jpeg"));
      }

      if (hls) hls.destroy();
    };

    const handleLoaded = () => {
      // ⏩ Seek to 2s to avoid black frame
      video.currentTime = 2;
    };

    const handleSeeked = () => {
      captureFrame();
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      video.addEventListener("loadedmetadata", handleLoaded);
      video.addEventListener("seeked", handleSeeked);
    } else {
      video.src = src;

      video.addEventListener("loadedmetadata", handleLoaded);
      video.addEventListener("seeked", handleSeeked);
    }

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [src]);

  if (!thumbnail) {
    return <div className="bg-gray-700 h-48 w-full animate-pulse" />;
  }

  return (
    <img
      src={thumbnail}
      className="w-full h-48 object-cover rounded"
      alt="thumbnail"
    />
  );
}