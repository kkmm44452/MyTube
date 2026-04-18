"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import {
  FaHouse,
  FaFilm,
  FaTv,
  FaClock,
  FaList,
  FaBars,
} from "react-icons/fa6";

const items = [
  { href: "/", label: "Home", icon: <FaHouse /> },
  { href: "/shorts", label: "Shorts", icon: <FaFilm /> },
  { href: "/subs", label: "Subscriptions", icon: <FaTv /> },
  { href: "/history", label: "History", icon: <FaClock /> },
  { href: "/library", label: "Library", icon: <FaList /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <button className={styles.toggle} onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </button>

      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.item} ${
            pathname === item.href ? styles.active : ""
          }`}
        >
          {item.icon}
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </aside>
  );
}