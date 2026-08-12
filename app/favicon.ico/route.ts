import { NextRequest, NextResponse } from 'next/server';
import { GET as getFavicon } from '@/app/api/favicon/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return getFavicon(request);
}
