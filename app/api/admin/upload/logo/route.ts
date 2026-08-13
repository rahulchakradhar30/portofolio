import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { validateImageMagicBytes, computeFileHash } from '@/app/lib/imageOptimization';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-logo-upload', max: 20, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response = NextResponse.json(
        { success: false, error: 'No logo file provided' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const response = NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Read file buffer & validate file signature magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const magicCheck = validateImageMagicBytes(fileBuffer);

    if (!magicCheck.valid) {
      const response = NextResponse.json(
        { success: false, error: magicCheck.error || 'Invalid image file signature or format' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Compute SHA-256 hash for deduplication
    const fileHash = computeFileHash(fileBuffer);
    const db = getAdminDb();
    const duplicateAssetSnap = await db
      .collection('media_assets')
      .where('fileHash', '==', fileHash)
      .limit(1)
      .get();

    if (!duplicateAssetSnap.empty) {
      const existingAsset = duplicateAssetSnap.docs[0].data();
      const response = NextResponse.json(
        {
          success: true,
          imageUrl: existingAsset.url,
          publicId: existingAsset.publicId,
          fileName: file.name,
          size: file.size,
          isDuplicate: true,
        },
        { status: 200 }
      );
      return addCorsHeaders(response);
    }

    // Cloudinary upload
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const response = NextResponse.json(
        { success: false, error: 'Cloudinary storage is not configured.' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', uploadPreset);
    uploadFormData.append('folder', 'portfolio/experience_logos');

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json();
      console.error('[LOGO UPLOAD ERROR] Cloudinary error:', error);
      const response = NextResponse.json(
        { success: false, error: 'Failed to upload logo to storage provider', details: error },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const data = await cloudinaryResponse.json();

    // Optimize URL: transform logo for efficient display (max 400 width/height, auto format & quality)
    let optimizedUrl = data.secure_url;
    if (data.secure_url && data.secure_url.includes('/upload/')) {
      optimizedUrl = data.secure_url.replace('/upload/', '/upload/w_400,h_400,c_limit,q_auto,f_auto/');
    }

    // Record asset in media_assets collection
    await db.collection('media_assets').add({
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      fileHash: fileHash,
      url: optimizedUrl,
      publicId: data.public_id,
      created_at: new Date().toISOString(),
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'experience.logo_upload',
      details: { publicId: data.public_id, fileName: file.name },
    });

    const response = NextResponse.json(
      {
        success: true,
        imageUrl: optimizedUrl,
        publicId: data.public_id,
        fileName: file.name,
        size: file.size,
        isDuplicate: false,
      },
      { status: 200 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[LOGO UPLOAD ERROR]', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to process logo upload', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
