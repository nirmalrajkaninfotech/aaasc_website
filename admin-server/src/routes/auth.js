import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, logout } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const result = await login(username, password);
    
    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  })
);

// POST /api/auth/logout - User logout
router.post('/logout', 
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      logout(token);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

export default router;
