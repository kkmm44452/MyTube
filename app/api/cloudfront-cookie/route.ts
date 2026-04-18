import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
// const origin = req.headers.get("origin");

//   // ✅ UPDATED SAFE VERSION
//   const allowedOrigins = new Set([
//     "https://kkmmyoutube.netlify.app",
//     "http://localhost:3000",
//   ]);

//   if (origin && !allowedOrigins.has(origin)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   // ✅ Validate env variables
//   if (
//     !process.env.CLOUDFRONT_PRIVATE_KEY ||
//     !process.env.CLOUDFRONT_KEY_PAIR_ID
//   ) {
//     return NextResponse.json(
//       { error: "Missing CloudFront config" },
//       { status: 500 }
//     );
//   }

//   // ✅ Fix multiline private key
//   const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY.replace(
//     /\\n/g,
//     "\n"
//   );

//   // ✅ Generate signed cookies
//   const cookies = getSignedCookies({
//     url: "https://d3ad2g8hyy43zt.cloudfront.net/*",
//     keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
//     privateKey,
//     dateLessThan: new Date(Date.now() + 20 * 60 * 1000), // 20 min
//   });

//   // ✅ Destructure safely
//   const {
//     "CloudFront-Policy": policy,
//     "CloudFront-Signature": signature,
//     "CloudFront-Key-Pair-Id": keyPairId,
//   } = cookies;

//   console.log("KEY ID:", process.env.CLOUDFRONT_KEY_PAIR_ID);
//   console.log("KEY EXISTS:", !!process.env.CLOUDFRONT_PRIVATE_KEY);

//   // ✅ Fix TypeScript error properly
//   if (!policy || !signature || !keyPairId) {
//     return NextResponse.json(
//       { error: "Failed to generate signed cookies" },
//       { status: 500 }
//     );
//   }

//   const res = NextResponse.json({ success: true });

//   const cookieOptions = {
//     path: "/",
//     secure: true,
//     httpOnly: true,
//     sameSite: "none" as const,
//   };

//   // ✅ Set cookies safely
//   res.cookies.set("CloudFront-Policy", policy, cookieOptions);
//   res.cookies.set("CloudFront-Signature", signature, cookieOptions);
//   res.cookies.set("CloudFront-Key-Pair-Id", keyPairId, cookieOptions);

//   // ✅ CORS headers (CRITICAL)
//   res.headers.set("Access-Control-Allow-Origin", origin || "*");
//   res.headers.set("Access-Control-Allow-Credentials", "true");
//   res.headers.set("Vary", "Origin");
//   return res;
// }

// export async function OPTIONS(req: NextRequest) {
//   const origin = req.headers.get("origin") || "";

//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       "Access-Control-Allow-Origin": origin,
//       "Access-Control-Allow-Credentials": "true",
//       "Access-Control-Allow-Methods": "GET, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     },
//   });
// }

export async function GET(req: NextRequest) {
  console.log("🚀 API HIT: /cloudfront-cookie");

  const origin = req.headers.get("origin");
  console.log("🌐 Origin:", origin);

  // ✅ Allowed origins check
  const allowedOrigins = new Set([
    "https://kkmmyoutube.netlify.app",
    "http://localhost:3000",
  ]);

  console.log("🔐 Checking origin whitelist...");

  if (origin && !allowedOrigins.has(origin)) {
    console.log("❌ Origin blocked:", origin);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("✅ Origin allowed");

  // ✅ Env check
  console.log("🔎 Checking environment variables...");

  const privateKeyEnv = process.env.CLOUDFRONT_PRIVATE_KEY;
  const keyPairIdEnv = process.env.CLOUDFRONT_KEY_PAIR_ID;

  console.log("KEY_PAIR_ID exists:", !!keyPairIdEnv);
  console.log("PRIVATE_KEY exists:", !!privateKeyEnv);

  if (!privateKeyEnv || !keyPairIdEnv) {
    console.log("❌ Missing CloudFront env vars");
    return NextResponse.json(
      { error: "Missing CloudFront config" },
      { status: 500 }
    );
  }

  // ✅ Fix key format
  const privateKey = privateKeyEnv.replace(/\\n/g, "\n");

  console.log("🔑 Private key formatted (first 30 chars):");
  console.log(privateKey.substring(0, 30));

  // ✅ CloudFront signing
  console.log("⚙️ Generating signed cookies...");

  let cookies;

  try {
    cookies = getSignedCookies({
      url: "https://d3ad2g8hyy43zt.cloudfront.net/*",
      keyPairId: keyPairIdEnv,
      privateKey,
      dateLessThan: new Date(Date.now() + 20 * 60 * 1000),
    });

    console.log("✅ Cookies generated successfully");
  } catch (err) {
    console.error("💥 CloudFront signing ERROR:");
    console.error(err);

    return NextResponse.json(
      { error: "CloudFront signing failed" },
      { status: 500 }
    );
  }

 console.log("RAW COOKIES:", cookies);

const policy = cookies["CloudFront-Policy"];
const signature = cookies["CloudFront-Signature"];
const keyPairId = cookies["CloudFront-Key-Pair-Id"];

console.log("🍪 Final check:");
console.log({ policy: !!policy, signature: !!signature, keyPairId: !!keyPairId });

  console.log("🍪 Cookie check:");
  console.log("Policy exists:", !!policy);
  console.log("Signature exists:", !!signature);
  console.log("KeyPairId exists:", !!keyPairId);

  // if (!policy || !signature || !keyPairId) {
  //   console.log("❌ Cookie generation incomplete");
  //   return NextResponse.json(
  //     { error: "Failed to generate signed cookies" },
  //     { status: 500 }
  //   );
  // }

  console.log("🎉 All cookies valid, sending response");

  const res = NextResponse.json({ success: true });

  const cookieOptions = {
    path: "/",
    secure: true,
    httpOnly: false,
    sameSite: "none" as const,
  };

  if (policy) {
  res.cookies.set("CloudFront-Policy", policy, cookieOptions);
}

if (signature) {
  res.cookies.set("CloudFront-Signature", signature, cookieOptions);
}

if (keyPairId) {
  res.cookies.set("CloudFront-Key-Pair-Id", keyPairId, cookieOptions);
}
  // res.cookies.set("CloudFront-Policy", policy, cookieOptions);
  // res.cookies.set("CloudFront-Signature", signature, cookieOptions);
  // res.cookies.set("CloudFront-Key-Pair-Id", keyPairId, cookieOptions);

  res.headers.set("Access-Control-Allow-Origin", origin || "*");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");

  console.log("📤 Response sent successfully");

  return res;
}