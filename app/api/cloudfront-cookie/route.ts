
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