import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { assertAdminSession } from "@/app/lib/adminAuth";
import { enforceRateLimit } from "@/app/lib/rateLimit";
import { logAdminAudit } from "@/app/lib/adminAudit";
import serverFirebaseHelpers from "@/app/lib/firebaseServer";
import { getAdminDb } from "@/app/lib/firebaseAdmin";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const RESUME_FOLDER = "portfolio/resume";
const RESUME_PUBLIC_ID = "current";

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

function createCloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const signaturePayload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${signaturePayload}${apiSecret}`).digest("hex");
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: "admin-resume-upload", max: 10, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: "Cloudinary is not configured for resume uploads." },
          { status: 500 }
        )
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return addCorsHeaders(NextResponse.json({ success: false, error: "No file provided" }, { status: 400 }));
    }

    if (file.type !== "application/pdf") {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: "Resume must be a PDF file" }, { status: 400 })
      );
    }

    if (file.size > MAX_PDF_BYTES) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: "Resume file size exceeds 10MB limit" }, { status: 400 })
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");
    const db = getAdminDb();

    const duplicateAssetSnap = await db
      .collection("media_assets")
      .where("fileHash", "==", fileHash)
      .where("assetKind", "==", "resume")
      .limit(1)
      .get();

    if (!duplicateAssetSnap.empty) {
      const existingAsset = duplicateAssetSnap.docs[0].data();
      
      // Only reuse the asset if it has the correct .pdf extension from our fix
      // AND is not a raw resource (so it's delivered properly)
      if (existingAsset.url && existingAsset.url.endsWith(".pdf") && existingAsset.url.includes("/image/upload/")) {
        const updatedContent = await serverFirebaseHelpers.updatePortfolioContent({ resumeUrl: existingAsset.url });

        const response = NextResponse.json(
          {
            success: true,
            resumeUrl: existingAsset.url,
            fileUrl: existingAsset.url,
            publicId: existingAsset.publicId,
            fileName: file.name,
            size: file.size,
            isDuplicate: true,
            content: updatedContent,
          },
          { status: 200 }
        );

        return addCorsHeaders(response);
      }
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = `${RESUME_FOLDER}/${RESUME_PUBLIC_ID}`;
    const uploadParams = {
      folder: RESUME_FOLDER,
      public_id: RESUME_PUBLIC_ID,
      overwrite: "true",
      invalidate: "true",
      timestamp,
    };
    const signature = createCloudinarySignature(uploadParams, apiSecret);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp);
    uploadFormData.append("folder", RESUME_FOLDER);
    uploadFormData.append("public_id", RESUME_PUBLIC_ID);
    uploadFormData.append("overwrite", "true");
    uploadFormData.append("invalidate", "true");
    uploadFormData.append("signature", signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json().catch(() => ({}));
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: "Failed to upload resume to Cloudinary", details: error },
          { status: 400 }
        )
      );
    }

    const data = await cloudinaryResponse.json();
    const secureUrl = data.secure_url as string;
    const updatedContent = await serverFirebaseHelpers.updatePortfolioContent({ resumeUrl: secureUrl });

    await db.collection("media_assets").add({
      assetKind: "resume",
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      fileHash,
      url: secureUrl,
      publicId: data.public_id || publicId,
      resourceType: "image",
      created_at: new Date().toISOString(),
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || "admin",
      action: "upload.resume",
      details: { publicId: data.public_id || publicId, fileName: file.name, fileType: file.type },
    });

    const response = NextResponse.json(
      {
        success: true,
        resumeUrl: secureUrl,
        fileUrl: secureUrl,
        publicId: data.public_id || publicId,
        version: data.version,
        fileName: file.name,
        size: file.size,
        content: updatedContent,
      },
      { status: 200 }
    );

    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: "Failed to upload resume", details: errorMessage },
        { status: 500 }
      )
    );
  }
}