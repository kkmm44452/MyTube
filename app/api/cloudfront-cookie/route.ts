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
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
    const privateKeyRaw = process.env.CLOUDFRONT_PRIVATE_KEY;

    if (!keyPairId || !privateKeyRaw) {
      return NextResponse.json(
        { error: "Missing CloudFront credentials" },
        { status: 500 }
      );
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

    //const resource = "https://d3ad2g8hyy43zt.cloudfront.net/hls/*"; checking it for the production
    const resource = "https://d3ad2g8hyy43zt.cloudfront.net/*";

    const cookies = getSignedCookies({
      keyPairId,
      privateKey,
      policy: JSON.stringify({
        Statement: [
          {
            Resource: resource,
            Condition: {
              DateLessThan: {
                "AWS:EpochTime": Math.floor(Date.now() / 1000) + 60 * 60,
              },
            },
          },
        ],
      }),
    });

    const policy = cookies["CloudFront-Policy"];
    const signature = cookies["CloudFront-Signature"];
    const keyPair = cookies["CloudFront-Key-Pair-Id"];

    if (!policy || !signature || !keyPair) {
      return NextResponse.json(
        { error: "Failed to generate cookies" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ success: true });

    // 🚨 IMPORTANT: DO NOT set domain manually for application for same domain host
    const cookieOptions = {
      path: "/",
      secure: true,
      sameSite: "none" as const,
      httpOnly: false,
    };

// const cookieOptions = {
//   path: "/",
//   secure: true,
//   sameSite: "none" as const,
//   httpOnly: false,
//   domain: ".cloudfront.net", // 🔥 CRITICAL
// };


    res.cookies.set("CloudFront-Policy", policy, cookieOptions);
    res.cookies.set("CloudFront-Signature", signature, cookieOptions);
    res.cookies.set("CloudFront-Key-Pair-Id", keyPair, cookieOptions);

    res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");

    return res;
  } catch (err: any) {
    console.error("CloudFront cookie error:", err);

    return NextResponse.json(
      { error: err.message || "cookie error" },
      { status: 500 }
    );
  }
}