import { spawn } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Missing S3 key" });

  // Spawn a Node process safely without shell interpolation
  const processor = spawn("node", ["./processor/process-video.js", key], {
    stdio: "inherit", // optional: logs stdout/stderr to server console
  });

  processor.on("error", (err) => {
    console.error("Video processor error:", err);
  });

  processor.on("exit", (code) => {
    console.log(`Video processor exited with code ${code}`);
  });

  // Respond immediately — processing runs in background
  res.status(200).json({ message: "Video processing started" });
}