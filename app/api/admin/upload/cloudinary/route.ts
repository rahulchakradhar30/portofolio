import { NextRequest, NextResponse } from 'next/server';

// Upload to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be an image or video' },
        { status: 400 }
      );
    }

    // Create FormData for Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');
    uploadFormData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json();
      console.error('Cloudinary error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary' },
        { status: 400 }
      );
    }

    const data = await cloudinaryResponse.json();

    return NextResponse.json(
      {
        success: true,
        imageUrl: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        size: file.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
