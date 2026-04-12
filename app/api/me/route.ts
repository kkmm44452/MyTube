import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match?.[1];

    if (!token) return NextResponse.json({ user: null });

    try {
      const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET missing");
      return NextResponse.json({ user: null }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret);

    return NextResponse.json({ user: decoded });
      
    } catch {
      return NextResponse.json({ user: null });
    }
  } catch {
    return NextResponse.json({ user: null });
  }
}