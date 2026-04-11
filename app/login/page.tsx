"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // -----------------------------
  // Redirect to dashboard if already logged in
  // -----------------------------
  useEffect(() => {
    // console.log("Login useEffect - user/loading changed:", { user, loading });
    if (!loading && user) {
      console.log("User already logged in, redirecting to /dashboard");
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // -----------------------------
  // Handle login click
  // -----------------------------
  const handleLogin = async () => {
    console.log("Attempting login with email:", email);
    if (!email || !password) {
      console.warn("Email or password missing");
      return alert("Enter email & password");
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // important for cookie
      });

      const data = await res.json();
      // console.log("Login API response:", data);

      if (res.ok) {
        console.log("Login successful, refreshing AuthContext user...");
        await refreshUser();
        // console.log("User after refreshUser():", user);
        router.push("/dashboard"); // navigate to dashboard
      } else {
        console.error("Login failed:", data.error);
        alert(data.error);
      }
    } catch (err) {
      console.error("Login request error:", err);
      alert("Login failed due to network or server error");
    }
  };

  // -----------------------------
  // Wait until AuthContext finishes loading
  // -----------------------------
  if (loading) {
    console.log("Login page waiting for AuthContext loading to finish");
    return <p className="text-white">Loading...</p>;
  }

  // -----------------------------
  // Login form
  // -----------------------------
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 p-6 rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>
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
          onClick={handleLogin}
          className="w-full bg-red-600 p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}