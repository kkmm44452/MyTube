"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a video");

    setLoading(true);

    // Get presigned URL from API
    const res = await fetch("/api/upload-url", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, type: file.type }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    // Upload video to S3
    await fetch(data.url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // Notify backend to start processing
    await fetch("/api/process-video", {
      method: "POST",
      body: JSON.stringify({ key: data.key }),
      headers: { "Content-Type": "application/json" },
    });

    setLoading(false);
    alert("Upload started! Video will be ready soon.");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Upload Video</h1>
      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mt-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}