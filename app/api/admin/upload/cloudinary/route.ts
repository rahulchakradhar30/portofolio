import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';

// Helper to add CORS headers
function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// Upload to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const response = NextResponse.json(
        { success: false, error: 'Cloudinary is not configured. Missing required environment variables.' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }

    console.log('[UPLOAD] Starting file upload to Cloudinary...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('[UPLOAD] No file provided in request');
      const response = NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('[UPLOAD] File received:', file.name, 'Size:', file.size);

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('[UPLOAD] File too large:', file.size);
      const response = NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
      console.warn('[UPLOAD] Invalid file type:', file.type);
      const response = NextResponse.json(
        { success: false, error: 'File must be an image, video, or PDF' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Create FormData for Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', uploadPreset);
    uploadFormData.append('cloud_name', cloudName);

    console.log('[UPLOAD] Uploading to Cloudinary with preset:', uploadPreset);

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json();
      console.error('[UPLOAD ERROR] Cloudinary error:', error);
      const response = NextResponse.json(
        { success: false, error: 'Failed to upload to Cloudinary', details: error },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const data = await cloudinaryResponse.json();
    console.log('[UPLOAD] Successfully uploaded:', data.public_id, 'URL:', data.secure_url);

    const response = NextResponse.json(
      {
        success: true,
        imageUrl: data.secure_url,
        fileUrl: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        size: file.size,
      },
      { status: 200 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[UPLOAD ERROR] Failed to upload file:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to upload file', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
