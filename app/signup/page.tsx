"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -----------------------------
  // Redirect if already logged in
  // -----------------------------
  useEffect(() => {
    // console.log("Signup useEffect:", { user, loading });

    if (!loading && user) {
      console.log("User already logged in → redirecting dashboard");
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // -----------------------------
  // Handle signup
  // -----------------------------
  const handleSignup = async () => {
    console.log("Signup attempt:", email);

    if (!email || !password) {
      return alert("Enter email & password");
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Signup response:", data);

      if (res.ok) {
        console.log("Signup successful → refreshing auth");
        await refreshUser(); // 🔥 THIS calls /api/me internally

        // console.log("User after refresh:", user);

        router.push("/dashboard");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed");
    }
  };

  // -----------------------------
  // Loading state (same as Login)
  // -----------------------------
  if (loading) {
    return <p className="text-white">Loading...</p>;
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 p-6 rounded w-80">
        <h2 className="text-xl mb-4">Signup</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 bg-gray-800 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 bg-gray-800 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-red-600 p-2 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}