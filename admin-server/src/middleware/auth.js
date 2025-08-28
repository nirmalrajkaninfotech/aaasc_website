import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Single admin credential (hashed)
// email: aaascollege2021@gmail.com
// password: aaascollege@123@123

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aaascollege2021@gmail.com';

// Use SHA-256 for hashing
const PASSWORD_HASH_HEX = (() => {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envPlain = process.env.ADMIN_PASSWORD;
  if (envHash && /^[a-f0-9]{64}$/i.test(envHash)) return envHash.toLowerCase();
  if (envPlain) return crypto.createHash('sha256').update(envPlain).digest('hex');
  // Fallback to the provided default password to avoid breaking local dev
  return crypto.createHash('sha256').update('aaascollege@123@123').digest('hex');
})();

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export const authenticate = (req, res, next) => {
  try {
    // Check for token in Authorization header
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // Fallback to checking cookies
    else if (req.cookies && req.cookies.admin_session) {
      token = req.cookies.admin_session;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.AUTH_SECRET || 'dev-secret', {
      algorithms: ['HS256']
    });

    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Clear invalid token from cookie if present
    if (req.cookies?.admin_session) {
      res.clearCookie('admin_session');
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const login = async (email, password) => {
  try {
    const isEmailMatch = email.trim().toLowerCase() === ADMIN_EMAIL;
    const isPasswordMatch = sha256Hex(password) === PASSWORD_HASH_HEX;

    if (!isEmailMatch || !isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    // Issue a signed JWT token with expiry
    const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 8); // 8 hours in seconds
    const user = {
      email: ADMIN_EMAIL,
      role: 'admin'
    };

    const token = jwt.sign(
      { ...user, exp: expiresAt },
      process.env.AUTH_SECRET || 'dev-secret',
      { algorithm: 'HS256' }
    );

    return {
      token,
      user
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

export const logout = (res) => {
  res.clearCookie('admin_session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper to set the authentication cookie
export const setAuthCookie = (res, token) => {
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
};
