import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getDefaultFaviconResponse(version?: string) {
  try {
    // Try serving default icon.svg from public folder
    const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
    if (fs.existsSync(svgPath)) {
      const svgBuffer = fs.readFileSync(svgPath);
      return new NextResponse(svgBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': version
            ? 'public, max-age=86400, immutable'
            : 'public, max-age=3600, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (err) {
    console.error('Error reading default favicon asset:', err);
  }

  // Pure SVG fallback string if file read fails
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%"><rect width="512" height="512" rx="128" fill="#1f1813"/><rect x="16" y="16" width="480" height="480" rx="112" fill="none" stroke="#d4af37" stroke-width="8"/><text x="256" y="320" font-family="sans-serif" font-size="160" font-weight="800" fill="#d4af37" text-anchor="middle">PRC</text></svg>`;

  return new NextResponse(fallbackSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': version
        ? 'public, max-age=86400, immutable'
        : 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('v') || undefined;

  try {
    const content = (await serverFirebaseHelpers.getPortfolioContent()) as {
      faviconConfig?: {
        enabled: boolean;
        url: string;
        mimeType?: string;
        version?: number;
      };
    } | null;

    const faviconConfig = content?.faviconConfig;

    if (faviconConfig && faviconConfig.enabled && faviconConfig.url) {
      const { url, mimeType } = faviconConfig;

      const cacheHeader = version || faviconConfig.version
        ? 'public, max-age=86400, immutable'
        : 'public, max-age=3600, s-maxage=86400';

      // 1. Handle remote URL (Cloudinary or HTTP asset)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const imageRes = await fetch(url);
        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const contentType = mimeType || imageRes.headers.get('content-type') || 'image/png';
          return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': cacheHeader,
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      // 2. Handle base64 Data URI
      if (url.startsWith('data:')) {
        const matches = url.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const inferredType = matches[1] || mimeType || 'image/png';
          const buffer = Buffer.from(matches[2], 'base64');
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': inferredType,
              'Cache-Control': cacheHeader,
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    }

    // Default fallback
    return getDefaultFaviconResponse(version);
  } catch (error) {
    console.error('[FAVICON ENDPOINT ERROR]', error);
    return getDefaultFaviconResponse(version);
  }
}
