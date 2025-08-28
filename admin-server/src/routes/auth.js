import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, logout, setAuthCookie } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/auth/login - Admin login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const { token, user } = await login(email, password);
    
    // Set the auth cookie
    setAuthCookie(res, token);
    
    // Return success response without sensitive data
    res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role
      }
    });
  })
);

// POST /api/auth/logout - Admin logout
router.post('/logout', 
  asyncHandler(async (req, res) => {
    // Clear the auth cookie
    logout(res);
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  })
);

export default router;
