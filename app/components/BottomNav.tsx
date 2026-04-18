"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./bottom.module.css";
import { FaHouse, FaFilm, FaTv, FaUser } from "react-icons/fa6";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", icon: <FaHouse /> },
    { href: "/shorts", icon: <FaFilm /> },
    { href: "/subs", icon: <FaTv /> },
    { href: "/profile", icon: <FaUser /> },
  ];

  return (
    <div className={styles.bottom}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.item} ${
            pathname === item.href ? styles.active : ""
          }`}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
}