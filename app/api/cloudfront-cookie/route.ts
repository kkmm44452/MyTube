// import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   console.log("🚀 API HIT: /cloudfront-cookie");

//   const origin = req.headers.get("origin");

//   const allowedOrigins = new Set([
//     "https://kkmmyoutube.netlify.app",
//     "http://localhost:3000",
//   ]);

//   console.log("🌐 Origin:", origin);

//   if (origin && !allowedOrigins.has(origin)) {
//     console.log("❌ Origin blocked:", origin);
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   console.log("✅ Origin allowed");

//   const privateKeyEnv = process.env.CLOUDFRONT_PRIVATE_KEY;
//   const keyPairIdEnv = process.env.CLOUDFRONT_KEY_PAIR_ID;

//   if (!privateKeyEnv || !keyPairIdEnv) {
//     console.log("❌ Missing env vars");
//     return NextResponse.json(
//       { error: "Missing CloudFront config" },
//       { status: 500 }
//     );
//   }

//   const privateKey = privateKeyEnv.replace(/\\n/g, "\n");

//   console.log("⚙️ Generating signed cookies...");

//   // ✅ MUST USE CUSTOM POLICY (required for Key Groups)
//   const resource = "https://d3ad2g8hyy43zt.cloudfront.net/*";

//   const expires = Math.floor(Date.now() / 1000) + 20 * 60;

//   const customPolicy = JSON.stringify({
//     Statement: [
//       {
//         Resource: resource,
//         Condition: {
//           DateLessThan: {
//             "AWS:EpochTime": expires,
//           },
//         },
//       },
//     ],
//   });

//   let cookies;

//   try {
//     cookies = getSignedCookies({
//       keyPairId: keyPairIdEnv,
//       privateKey,
//       policy: customPolicy, // 🔥 IMPORTANT FIX
//     });

//     console.log("✅ Cookies generated successfully");
//   } catch (err) {
//     console.error("❌ CloudFront signing error:", err);

//     return NextResponse.json(
//       { error: "CloudFront signing failed" },
//       { status: 500 }
//     );
//   }

//   console.log("RAW COOKIES:", cookies);

//   const policy = cookies["CloudFront-Policy"];
//   const signature = cookies["CloudFront-Signature"];
//   const keyPairId = cookies["CloudFront-Key-Pair-Id"];

//   console.log("🍪 Final check:", {
//     policy: !!policy,
//     signature: !!signature,
//     keyPairId: !!keyPairId,
//   });

//   if (!policy || !signature || !keyPairId) {
//     console.log("❌ Missing cookie parts");
//     return NextResponse.json(
//       { error: "Failed to generate signed cookies" },
//       { status: 500 }
//     );
//   }

//   const res = NextResponse.json({ success: true });

//   const cookieOptions = {
//     path: "/",
//     secure: true,
//     httpOnly: false, // 🔥 REQUIRED for HLS
//     sameSite: "none" as const,

//   };

//   res.cookies.set("CloudFront-Policy", policy, cookieOptions);
//   res.cookies.set("CloudFront-Signature", signature, cookieOptions);
//   res.cookies.set("CloudFront-Key-Pair-Id", keyPairId, cookieOptions);

//   res.headers.set("Access-Control-Allow-Origin", origin || "*");
//   res.headers.set("Access-Control-Allow-Credentials", "true");
//   res.headers.set("Vary", "Origin");

//   console.log("📤 Response sent successfully");

//   return res;
// }

import { NextRequest, NextResponse } from "next/server";
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";

export async function GET(req: NextRequest) {
  try {
    const resourceUrl = "https://d3ad2g8hyy43zt.cloudfront.net/hls/*";

    const cookies = getSignedCookies({
      url: resourceUrl,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
    });

    const res = NextResponse.json({ success: true });

    // ✅ Set CloudFront cookies
    Object.entries(cookies).forEach(([key, value]) => {
      res.cookies.set({
        name: key,
        value,
        domain: ".cloudfront.net",
        path: "/",
        secure: true,
        httpOnly: false,
        sameSite: "none",
      });
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "cookie error" },
      { status: 500 }
    );
  }
}