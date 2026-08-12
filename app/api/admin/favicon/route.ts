import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { createHash } from 'crypto';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

// Magic bytes validation
function validateFileSignature(buffer: Buffer, mimeType: string, fileName: string): boolean {
  if (buffer.length < 4) return false;

  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  const lowerName = fileName.toLowerCase();

  // PNG: 89 50 4E 47
  if (hex.startsWith('89504E47')) return true;

  // JPEG: FF D8 FF
  if (hex.startsWith('FFD8FF')) return true;

  // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  if (hex.startsWith('52494646')) {
    const webpHeader = buffer.toString('ascii', 8, 12);
    if (webpHeader === 'WEBP') return true;
  }

  // ICO: 00 00 01 00
  if (hex.startsWith('00000100') || lowerName.endsWith('.ico') || mimeType.includes('icon')) {
    return true;
  }

  // SVG: starts with <svg or <?xml containing <svg
  if (lowerName.endsWith('.svg') || mimeType.includes('svg')) {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000)).trim().toLowerCase();
    if (content.includes('<svg') || content.includes('xmlns=')) {
      return true;
    }
  }

  return false;
}

// POST - Upload, normalize, store, and set new Favicon
export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-favicon-upload', max: 15, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
      );
    }

    // 2MB size limit for favicon
    if (file.size > 2 * 1024 * 1024) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: 'Favicon file size exceeds 2MB limit' }, { status: 400 })
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Validate MIME type & magic bytes
    if (!validateFileSignature(rawBuffer, file.type, file.name)) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: 'Invalid or corrupted image file. Supported formats: PNG, JPG, WEBP, ICO, SVG.' },
          { status: 400 }
        )
      );
    }

    // Process & Normalize image to 64x64 square PNG using Sharp
    let normalizedPngBuffer: Buffer;
    try {
      normalizedPngBuffer = await sharp(rawBuffer)
        .resize(64, 64, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9, quality: 90 })
        .toBuffer();
    } catch (sharpError) {
      console.error('[FAVICON SHARP ERROR]', sharpError);
      return addCorsHeaders(
        NextResponse.json({ success: false, error: 'Failed to process and normalize favicon image.' }, { status: 422 })
      );
    }

    // Upload to Cloudinary if configured
    let assetUrl = '';
    let publicId = '';

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio';

    if (cloudName && uploadPreset) {
      try {
        const cldFormData = new FormData();
        const blob = new Blob([new Uint8Array(normalizedPngBuffer)], { type: 'image/png' });
        cldFormData.append('file', blob, `favicon-${Date.now()}.png`);
        cldFormData.append('upload_preset', uploadPreset);
        cldFormData.append('folder', 'portfolio/branding');

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cldFormData,
        });

        if (cldRes.ok) {
          const cldData = await cldRes.json();
          assetUrl = cldData.secure_url;
          publicId = cldData.public_id;
        }
      } catch (cldError) {
        console.warn('[FAVICON CLOUDINARY UPLOAD WARNING]', cldError);
      }
    }

    // Fallback to inline Base64 data URI if Cloudinary is not configured or failed
    if (!assetUrl) {
      assetUrl = `data:image/png;base64,${normalizedPngBuffer.toString('base64')}`;
    }

    // Update Favicon Config in Firestore
    const faviconConfig = {
      enabled: true,
      url: assetUrl,
      publicId: publicId || undefined,
      originalName: file.name,
      mimeType: 'image/png',
      size: normalizedPngBuffer.length,
      updatedAt: new Date().toISOString(),
      version: Date.now(),
    };

    await serverFirebaseHelpers.updatePortfolioContent({ faviconConfig });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'favicon.upload',
      details: { originalName: file.name, size: normalizedPngBuffer.length, publicId },
    });

    return addCorsHeaders(
      NextResponse.json({ success: true, faviconConfig }, { status: 200 })
    );
  } catch (error) {
    console.error('[FAVICON POST ERROR]', error);
    return addCorsHeaders(
      NextResponse.json({ success: false, error: 'Failed to upload favicon' }, { status: 500 })
    );
  }
}

// PUT - Update Favicon configuration state (e.g., Enable/Disable)
export async function PUT(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const body = await request.json();
    const { enabled } = body;

    const content = (await serverFirebaseHelpers.getPortfolioContent()) as {
      faviconConfig?: Record<string, unknown>;
    } | null;

    const currentConfig = content?.faviconConfig || { enabled: false, url: '' };

    const updatedFaviconConfig = {
      ...currentConfig,
      enabled: typeof enabled === 'boolean' ? enabled : currentConfig.enabled,
      version: Date.now(),
      updatedAt: new Date().toISOString(),
    };

    await serverFirebaseHelpers.updatePortfolioContent({ faviconConfig: updatedFaviconConfig });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'favicon.toggle',
      details: { enabled: updatedFaviconConfig.enabled },
    });

    return addCorsHeaders(
      NextResponse.json({ success: true, faviconConfig: updatedFaviconConfig }, { status: 200 })
    );
  } catch (error) {
    console.error('[FAVICON PUT ERROR]', error);
    return addCorsHeaders(
      NextResponse.json({ success: false, error: 'Failed to update favicon configuration' }, { status: 500 })
    );
  }
}

// DELETE - Deactivate custom favicon and restore default portfolio favicon
export async function DELETE(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const content = (await serverFirebaseHelpers.getPortfolioContent()) as {
      faviconConfig?: { publicId?: string };
    } | null;

    const publicId = content?.faviconConfig?.publicId;

    // Delete asset from Cloudinary if publicId exists
    if (publicId && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
        const signature = createHash('sha1').update(stringToSign).digest('hex');

        const deleteFormData = new FormData();
        deleteFormData.append('public_id', publicId);
        deleteFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
        deleteFormData.append('timestamp', timestamp.toString());
        deleteFormData.append('signature', signature);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
          await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            body: deleteFormData,
          });
        }
      } catch (cldDelError) {
        console.warn('[FAVICON CLOUDINARY DESTROY WARNING]', cldDelError);
      }
    }

    const resetFaviconConfig = {
      enabled: false,
      url: '',
      publicId: '',
      originalName: '',
      mimeType: '',
      size: 0,
      updatedAt: new Date().toISOString(),
      version: Date.now(),
    };

    await serverFirebaseHelpers.updatePortfolioContent({ faviconConfig: resetFaviconConfig });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'favicon.delete',
      details: { restoredDefault: true },
    });

    return addCorsHeaders(
      NextResponse.json({ success: true, faviconConfig: resetFaviconConfig }, { status: 200 })
    );
  } catch (error) {
    console.error('[FAVICON DELETE ERROR]', error);
    return addCorsHeaders(
      NextResponse.json({ success: false, error: 'Failed to reset favicon' }, { status: 500 })
    );
  }
}
