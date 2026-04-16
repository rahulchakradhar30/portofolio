import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';

// Get single certification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certification = await serverFirebaseHelpers.getCertificationById(id);

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ certification }, { status: 200 });
  } catch (error) {
    console.error('Fetch certification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}

// PUT - Update certification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const updateData = await request.json();

    const updatedCertification = await serverFirebaseHelpers.updateCertification(id, updateData);

    return NextResponse.json(
      { success: true, certification: updatedCertification },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update certification error:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    await serverFirebaseHelpers.deleteCertification(id);

    return NextResponse.json(
      { success: true, message: 'Certification deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete certification error:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}
