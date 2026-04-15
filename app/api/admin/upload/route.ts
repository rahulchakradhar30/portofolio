import { NextRequest, NextResponse } from 'next/server';

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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'portfolio');
    cloudinaryFormData.append('folder', 'portfolio/projects');

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json();
      throw error;
    }

    const uploadedImage = await cloudinaryResponse.json();

    return NextResponse.json(
      {
        success: true,
        image: {
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
          width: uploadedImage.width,
          height: uploadedImage.height,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    
    const crypto = require('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    const deleteFormData = new FormData();
    deleteFormData.append('public_id', publicId);
    deleteFormData.append('api_key', process.env.CLOUDINARY_API_KEY || '');
    deleteFormData.append('timestamp', timestamp.toString());
    deleteFormData.append('signature', signature);

    const deleteResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: deleteFormData,
      }
    );

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }

    return NextResponse.json(
      { success: true, message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
