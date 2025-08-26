import jwt from 'jsonwebtoken';
import { readJsonFile } from '../utils/fileUtils.js';

// Simple in-memory session store (replace with Redis in production)
const activeSessions = new Set();

// Mock user (replace with database in production)
const users = [
  {
    id: 1,
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin'
  }
];

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (!activeSessions.has(token)) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const login = async (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '8h' }
  );

  // Store the session
  activeSessions.add(token);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
};

export const logout = (token) => {
  activeSessions.delete(token);
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
