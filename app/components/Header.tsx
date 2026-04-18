"use client";

import { FaYoutube, FaMoon, FaSun } from "react-icons/fa6";
import { useTheme } from "next-themes";

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <FaYoutube color="red" size={28} />
        <strong>YouTube</strong>
      </div>

      <input placeholder="Search" style={styles.search} />

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={styles.btn}
      >
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </header>
  );
}

const styles: any = {
  header: {
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    borderBottom: "1px solid #ddd",
    position: "fixed",
    width: "100%",
    top: 0,
    background: "var(--bg)",
    zIndex: 50,
  },
  left: { display: "flex", gap: 10, alignItems: "center" },
  search: {
    width: "40%",
    padding: 8,
    borderRadius: 20,
    border: "1px solid #ccc",
  },
  btn: { fontSize: 18, background: "none", border: "none" },
};