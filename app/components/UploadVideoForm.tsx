// "use client";

// import { useState } from "react";

// function UploadVideoForm() {
//   const [file, setFile] = useState<File | null>(null);
//   const [title, setTitle] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const handleUpload = async () => {
//     if (!file || !title) return alert("Please select a video and add a title");

//     setLoading(true);
//     setUploadProgress(0);

//     try {
//       // Step 1: Get presigned URL from your backend
//       const res = await fetch("/api/upload-url", {
//         method: "POST",
//         body: JSON.stringify({ filename: file.name, type: file.type }),
//         headers: { "Content-Type": "application/json" },
//       });
//       const { uploadURL, fileName } = await res.json();

//       // Step 2: Upload video to S3 with progress tracking
//       await new Promise<void>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("PUT", uploadURL);

//         xhr.upload.onprogress = (event) => {
//           if (event.lengthComputable) {
//             const percent = Math.round((event.loaded / event.total) * 100);
//             setUploadProgress(percent);
//             console.log(`Upload progress: ${percent}%`);
//           }
//         };

//         xhr.onload = () => {
//           if (xhr.status === 200 || xhr.status === 204) {
//             resolve();
//           } else {
//             reject(new Error("Upload failed"));
//           }
//         };

//         xhr.onerror = () => reject(new Error("Upload failed"));

//         xhr.setRequestHeader("Content-Type", file.type);
//         xhr.send(file);
//       });

//       // Step 3: Optionally trigger video processing in your backend
//       // await fetch("/api/process-video", {
//       //   method: "POST",
//       //   body: JSON.stringify({ key: `raw/${fileName}`, title }),
//       //   headers: { "Content-Type": "application/json" },
//       // });

//       alert("Upload finished! Video will be processed soon.");
//       setFile(null);
//       setTitle("");
//       setUploadProgress(0);
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="border p-4 rounded bg-gray-900 text-white">
//       <h2 className="text-xl mb-2">Upload a Video</h2>
//       <input
//         type="text"
//         placeholder="Video Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="border p-2 w-full mb-2 text-black"
//       />
//       <input
//         type="file"
//         accept="video/mp4"
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//         className="mb-2"
//       />
//       <button
//         onClick={handleUpload}
//         disabled={!file || !title || loading}
//         className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
//       >
//         {loading ? "Uploading..." : "Upload"}
//       </button>

//       {/* Progress Bar */}
//       {loading && (
//         <div className="w-full bg-gray-700 rounded h-4 mt-2">
//           <div
//             className="bg-blue-500 h-4 rounded"
//             style={{ width: `${uploadProgress}%` }}
//           />
//         </div>
//       )}

//       {/* Optional: show percentage text */}
//       {loading && <p className="mt-1">{uploadProgress}% uploaded</p>}
//     </div>
//   );
// }

// export default UploadVideoForm;

"use client";

import { useState, useEffect, useRef } from "react";
// import { useSession } from "next-auth/react";  ////for google sign up
import { useAuth } from "@/context/AuthContext"; // 👈 your auth

function UploadVideoForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [networkQuality, setNetworkQuality] = useState("Checking...");
  const MAX_FILE_SIZE = 480 * 1024 * 1024; // 180 MB
  // const { data: session } = useSession();  //for google signup
  const { user } = useAuth(); // 👈 GET USER ID FROM YOUR AUTH
  useEffect(() => {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) return;

  const updateConnection = () => {
    const downlink = connection.downlink; // Mbps
    const type = connection.effectiveType;

    setNetworkInfo({ downlink, type });

    // 🎯 classify network quality
    if (downlink >= 10) {
      setNetworkQuality("Fast 🚀");
    } else if (downlink >= 3) {
      setNetworkQuality(" Medium⚡");
    } else {
      setNetworkQuality("Slow 🐢");
    }
  };

  updateConnection();
  connection.addEventListener("change", updateConnection);

  return () => {
    connection.removeEventListener("change", updateConnection);
  };
}, []);

  const handleUpload = async () => {
    if (!file || !title) return alert("Please select a video and add a title");

  // ✅ FILE SIZE CHECK HERE
  if (file.size > MAX_FILE_SIZE) {
    alert("File must be less than 480 MB");
    setFile(null);
    // ✅ clear actual file input UI
        if (fileInputRef.current) 
        {
          fileInputRef.current.value = "";
        }
    return;
  }
    if (!user?.userId) {
      return alert("User not logged in");
    }
    setLoading(true);
    setUploadProgress(0);

    try {
      // 🔥 STEP 1: get DB + Lambda upload URL
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
         filename: file.name,
          type: file.type,
          userId: user.userId, // ✅ FROM YOUR AUTH
           title ,
  description, // ✅ ADD THIS
        }),
      });

      const data = await res.json();

      const { uploadUrl, videoId, key } = data;

      if (!uploadUrl || !videoId) {
        throw new Error("Invalid response from server");
      }

      console.log("🚀 Upload starting for video:", videoId);

      // 🔥 STEP 2: Upload to S3 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        let lastLoaded = 0;
        let lastTime = Date.now();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
            console.log(`Upload progress: ${percent}%`);
             const now = Date.now();
             const timeDiff = (now - lastTime) / 1000;
             const loadedDiff = event.loaded - lastLoaded;

             if (timeDiff > 0) 
             {
             const speed = loadedDiff / timeDiff;
             setUploadSpeed(speed);
             }

              lastLoaded = event.loaded;
              lastTime = now;
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

     // 🔥 STEP 3: mark upload complete (IMPORTANT for pipeline)
      await fetch("/api/videouploadcomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          status: "UPLOADED",
        }),
      });

      alert("Upload finished! Video will be processed soon.");

      setFile(null);
      setTitle("");
      setUploadProgress(0);

      // ✅ clear actual file input UI
        if (fileInputRef.current) 
        {
          fileInputRef.current.value = "";
        }

        // ✅ refresh page
        window.location.reload();
        
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }

    setLoading(false);
  };

  return (
    <div className="border p-4 rounded bg-gray-900 text-white">
      <h2 className="text-xl mb-2">Upload a Video</h2>
      {networkInfo && (
  <div className="mb-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
    <div className="flex justify-between items-center text-sm">
      <span>🌐 {networkInfo.type?.toUpperCase()}</span>
      <span>{networkQuality}</span>
    </div>

    <div className="text-xs text-gray-400 mt-1">
      ⬇ Download: ~{networkInfo.downlink} Mbps
    </div>

    {loading && (
      <div className="text-xs text-blue-400 mt-1">
        ⬆ {uploadSpeed ? (uploadSpeed / 1024 / 1024).toFixed(2) : "0.00"} MB/s
      </div>
    )}
     <p>⬆ Upload: ~{(networkInfo.downlink * 0.3).toFixed(1)} Mbps (est.)</p>
  </div>
      )}
{networkQuality === "Slow 🐢" && (
  <div className="text-red-400 text-sm mb-2">
    ⚠️ Your internet is slow. Upload may take longer or fail.
  </div>
)}
      <input
        type="text"
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2 text-white"
      />

      <textarea
  placeholder="Video Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="border p-2 w-full mb-2 text-white"
/>

      <input
       ref={fileInputRef}
        type="file"
        accept="video/mp4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />

      {file && ( <p className="text-sm text-gray-400">
                 Size: {(file.size / 1024 / 1024).toFixed(2)} MB / 480 MB max
                </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !title || loading}
        className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-700 rounded h-4 mt-2">
          <div
            className="bg-blue-500 h-4 rounded"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {loading && <p className="mt-1">{uploadProgress}% uploaded</p>}
    </div>
  );
}

export default UploadVideoForm;
