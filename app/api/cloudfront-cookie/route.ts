import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
const origin = req.headers.get("origin");

  // ✅ UPDATED SAFE VERSION
  const allowedOrigins = new Set([
    "https://kkmmyoutube.netlify.app",
    "http://localhost:3000",
  ]);

  if (origin && !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Validate env variables
  if (
    !process.env.CLOUDFRONT_PRIVATE_KEY ||
    !process.env.CLOUDFRONT_KEY_PAIR_ID
  ) {
    return NextResponse.json(
      { error: "Missing CloudFront config" },
      { status: 500 }
    );
  }

  // ✅ Fix multiline private key
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY.replace(
    /\\n/g,
    "\n"
  );

  // ✅ Generate signed cookies
  const cookies = getSignedCookies({
    url: "https://d3ad2g8hyy43zt.cloudfront.net/*",
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey,
    dateLessThan: new Date(Date.now() + 20 * 60 * 1000), // 20 min
  });

  // ✅ Destructure safely
  const {
    "CloudFront-Policy": policy,
    "CloudFront-Signature": signature,
    "CloudFront-Key-Pair-Id": keyPairId,
  } = cookies;

  // ✅ Fix TypeScript error properly
  if (!policy || !signature || !keyPairId) {
    return NextResponse.json(
      { error: "Failed to generate signed cookies" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ success: true });

  const cookieOptions = {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "none" as const,
  };

  // ✅ Set cookies safely
  res.cookies.set("CloudFront-Policy", policy, cookieOptions);
  res.cookies.set("CloudFront-Signature", signature, cookieOptions);
  res.cookies.set("CloudFront-Key-Pair-Id", keyPairId, cookieOptions);

  // ✅ CORS headers (CRITICAL)
  res.headers.set("Access-Control-Allow-Origin", origin || "*");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}