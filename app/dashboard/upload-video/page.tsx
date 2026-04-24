"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import VideoPlayer from "@/app/components/VideoPlayer";
import UploadVideoForm from "@/app/components/UploadVideoForm";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // -----------------------------
  // Log auth state changes
  // -----------------------------
  useEffect(() => {
    // console.log("Dashboard useEffect: user/loading changed", { user, loading });
    if (!loading && !user) {
      console.log("No user found, redirecting to /login");
      router.replace("/login");
    }
  }, [user, loading, router]);

  // -----------------------------
  // Fetch videos after user is ready
  // -----------------------------
  useEffect(() => {
    if (!user) {
      console.log("Dashboard: user not yet available, skipping video fetch");
      return;
    }

    console.log("Dashboard: fetching videos for user:", user.userId);
    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos", { credentials: "include" });
        const data = await res.json();
       // console.log("Dashboard: videos fetched:", data.videos);
        setVideos(data.videos);
      } catch (error) {
        console.error("Dashboard: error fetching videos:", error);
      } finally {
        setVideosLoading(false);
        console.log("Dashboard: video fetch complete, videosLoading=false");
      }
    }

    fetchVideos();
  }, [user]);

  // -----------------------------
  // Logout handler with logs
  // -----------------------------
  const handleLogout = async () => {
    console.log("Dashboard: logging out...");
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    console.log("Dashboard: logout completed, redirecting to /login");
    router.push("/login");
  };

  // -----------------------------
  // Show loading state
  // -----------------------------
  if (loading || !user || videosLoading) {
    console.log("Dashboard: still loading, showing loading state");
    return <p className="text-white">Loading...</p>;
  }

  // -----------------------------
  // Dashboard render
  // -----------------------------
  // console.log("Dashboard: rendering dashboard UI with user and videos", {
  //   user,
  //   videos,
  // });

  return (
    <div className="text-white bg-black min-h-screen p-4">
      <h1 className="text-2xl mb-4">Welcome to Dashboard 🎉</h1>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-4 py-2 rounded mb-4"
      >
        Logout
      </button>

      <UploadVideoForm />

      <div className="mt-6">
        {videos?.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          videos?.map((video) => (
            <div key={video.id} className="mb-6">
              <h2 className="font-bold">{video.title}</h2>
            <VideoPlayer videoPath={`/api/cloudfront-playlist?video=${encodeURIComponent( video.masterUrl )}`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}