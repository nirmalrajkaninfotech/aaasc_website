import { NextRequest, NextResponse } from 'next/server';

async function sha256HexEdge(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    hex += h;
  }
  return hex;
}

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as { sub: string; exp: number };
    const expected = await sha256HexEdge((process.env.AUTH_SECRET || 'dev-secret') + '|' + payloadJson);
    if (expected !== signature) return false;
    if (Date.now() > payload.exp) return false;
    const allowedEmail = (process.env.ADMIN_EMAIL || 'aaascollege2021@gmail.com').toLowerCase();
    return payload.sub?.toLowerCase() === allowedEmail;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_session')?.value;
    if (!(await isValidToken(token))) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

// Middleware configuration
// For static export, we'll only protect admin routes in development
export const config = {
  matcher: [
    // Only protect admin routes in development
    // In production, this will be handled by the hosting provider
    '/admin/:path*',
  ],
};
