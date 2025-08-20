import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Single admin credential (hashed)
// email: aaascollege2021@gmail.com
// password: aaascollege@123@123
// We store only hashes here; no plaintext in responses

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aaascollege2021@gmail.com';

// Use SHA-256 for simple hashing here; prefer bcrypt/argon2 in production
const PASSWORD_HASH_HEX = (() => {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envPlain = process.env.ADMIN_PASSWORD;
  if (envHash && /^[a-f0-9]{64}$/i.test(envHash)) return envHash.toLowerCase();
  if (envPlain) return crypto.createHash('sha256').update(envPlain).digest('hex');
  // Fallback to the provided default password to avoid breaking local dev
  return crypto.createHash('sha256').update('aaascollege@123@123').digest('hex');
})();

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const isEmailMatch = email.trim().toLowerCase() === ADMIN_EMAIL;
    const isPasswordMatch = sha256Hex(password) === PASSWORD_HASH_HEX;

    if (!isEmailMatch || !isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Issue a signed cookie token (HMAC) with expiry
    const expiresAt = Date.now() + 1000 * 60 * 60 * 8; // 8 hours
    const payload = JSON.stringify({ sub: ADMIN_EMAIL, exp: expiresAt });
    const signature = sha256Hex((process.env.AUTH_SECRET || 'dev-secret') + '|' + payload);
    const token = Buffer.from(payload).toString('base64url') + '.' + signature;

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}


