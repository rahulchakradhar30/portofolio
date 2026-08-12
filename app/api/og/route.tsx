import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params
    const title = searchParams.get('title') || 'Rahul Chakradhar';
    const subtitle = searchParams.get('subtitle') || 'AI Systems Builder & Engineer';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2f241b',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #8d6b4e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #8d6b4e 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
            color: '#fffaf3',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(122, 95, 71, 0.4)',
              border: '2px solid rgba(141, 107, 78, 0.5)',
              padding: '60px',
              borderRadius: '24px',
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '80px',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
                lineHeight: 1.1,
                background: 'linear-gradient(to right, #fbf7f0, #b6926d)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '40px',
                fontWeight: 500,
                color: '#d6c0a8',
                letterSpacing: '0.05em',
                marginTop: 0,
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error('OG Image Generation Error:', e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
