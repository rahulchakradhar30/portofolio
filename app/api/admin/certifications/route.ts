import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

// GET - List all certifications
export async function GET() {
  try {
    const certifications = await serverFirebaseHelpers.getAllCertifications();

    return NextResponse.json({ certifications }, { status: 200 });
  } catch (error) {
    console.error('Fetch certifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

// POST - Create new certification
export async function POST(request: NextRequest) {
  try {
    const { title, issuer, issuedDate, expiryDate, credentialId, credentialUrl, image, description, linkedinUrl, featured } =
      await request.json();

    if (!title || !issuer || !image) {
      return NextResponse.json(
        { error: 'Title, issuer, and image are required' },
        { status: 400 }
      );
    }

    const newCertification = await serverFirebaseHelpers.createCertification({
      title,
      issuer,
      issuedDate,
      expiryDate,
      credentialId,
      credentialUrl,
      image,
      description,
      linkedinUrl,
      featured: featured || false,
    });

    return NextResponse.json(
      { success: true, certification: newCertification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create certification error:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}
