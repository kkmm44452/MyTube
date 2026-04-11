"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    await refreshUser(); // update state
    router.replace("/login"); // no history
  };

  if (loading) return null; // prevents flicker

  return (
    <header className="flex justify-between p-4 bg-black text-white">
      <h1 onClick={() => router.push("/")}>MyTube</h1>

      <div className="flex gap-4">
        {!user ? (
          <>
            <button onClick={() => router.push("/login")}>Login</button>
            <button onClick={() => router.push("/signup")}>Signup</button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/dashboard")}>+ Create</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}