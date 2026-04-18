// app/watch/[id]/page.tsx

import Image from "next/image";

interface Props {
  params: { id: string };
}

// 🔹 Fake data (replace with API later)
const video = {
  id: "dQw4w9WgXcQ",
  title: "Never Gonna Give You Up",
  channel: "Rick Astley",
  subscribers: "3.5M",
  views: "1.2B",
  likes: "12M",
  description: "The official video for Never Gonna Give You Up.",
};

const comments = [
  { id: 1, user: "User1", text: "Legendary song 🔥" },
  { id: 2, user: "User2", text: "Still listening in 2026 😄" },
];

const recommended = new Array(8).fill(null).map((_, i) => ({
  id: i,
  title: `Recommended Video ${i + 1}`,
  channel: "Some Channel",
}));

export default function WatchPage({ params }: Props) {
  const videoId = params.id;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">

      {/* LEFT SIDE */}
      <div className="flex-1">

        {/* 🎬 VIDEO PLAYER */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {/* 📺 TITLE */}
        <h1 className="text-xl font-semibold mt-4">
          {video.title}
        </h1>

        {/* 👤 CHANNEL + SUBSCRIBE */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <p className="font-medium">{video.channel}</p>
              <p className="text-sm text-gray-500">
                {video.subscribers} subscribers
              </p>
            </div>
          </div>

          <button className="bg-red-600 text-white px-4 py-2 rounded-full font-medium hover:bg-red-700">
            Subscribe
          </button>
        </div>

        {/* 👍 ACTION BUTTONS */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="px-4 py-2 bg-gray-200 rounded-full">
            👍 {video.likes}
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-full">
            👎 Dislike
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded-full">
            🔗 Share
          </button>
        </div>

        {/* 📝 DESCRIPTION */}
        <div className="mt-4 bg-gray-100 p-3 rounded-lg text-sm">
          <p className="font-medium">{video.views} views</p>
          <p className="mt-2">{video.description}</p>
        </div>

        {/* 💬 COMMENTS */}
        <div className="mt-6">
          <h2 className="font-semibold mb-4">
            {comments.length} Comments
          </h2>

          {/* Add Comment */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <input
              placeholder="Add a comment..."
              className="flex-1 border-b outline-none"
            />
          </div>

          {/* Comment List */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
                <div>
                  <p className="text-sm font-medium">{c.user}</p>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[350px]">

        <h3 className="font-semibold mb-3">Recommended</h3>

        <div className="space-y-4">
          {recommended.map((vid) => (
            <div key={vid.id} className="flex gap-3 cursor-pointer">
              
              {/* Thumbnail */}
              <div className="w-40 h-24 bg-gray-300 rounded-md" />

              {/* Info */}
              <div>
                <p className="text-sm font-medium line-clamp-2">
                  {vid.title}
                </p>
                <p className="text-xs text-gray-500">
                  {vid.channel}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}