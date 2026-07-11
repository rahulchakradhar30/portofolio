import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminDb } from '@/app/lib/firebaseAdmin';

// Enable CORS helper
function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - List all media assets
export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const db = getAdminDb();
    const snap = await db.collection('media_assets').orderBy('created_at', 'desc').get();
    const assets = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const response = NextResponse.json({ success: true, assets }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('List media assets error:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to list media assets' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE - Delete media asset registry from Firestore
export async function DELETE(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const { id } = await request.json();
    if (!id) {
      const response = NextResponse.json({ success: false, error: 'Media ID is required' }, { status: 400 });
      return addCorsHeaders(response);
    }

    const db = getAdminDb();
    await db.collection('media_assets').doc(id).delete();

    const response = NextResponse.json({ success: true, message: 'Media entry deleted' }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Delete media entry error:', error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to delete media asset registry' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
