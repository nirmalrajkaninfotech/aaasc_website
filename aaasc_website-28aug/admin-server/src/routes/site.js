import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const SITE_CONFIG_FILE = 'site';

// GET /api/site - Get site configuration
router.get('/', 
  asyncHandler(async (req, res) => {
    const siteConfig = readJsonFile(SITE_CONFIG_FILE) || {};
    res.json(siteConfig);
  })
);

// POST /api/site - Update site configuration (protected)
router.post('/', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const updatedConfig = req.body;
    
    // Merge with existing config to preserve any existing fields
    const currentConfig = readJsonFile(SITE_CONFIG_FILE) || {};
    const newConfig = { ...currentConfig, ...updatedConfig };
    
    writeJsonFile(SITE_CONFIG_FILE, newConfig);
    
    res.json({
      success: true,
      message: 'Site configuration updated successfully',
      data: newConfig
    });
  })
);

// GET /api/site/public - Get public site configuration
router.get('/public', 
  asyncHandler(async (req, res) => {
    const siteConfig = readJsonFile(SITE_CONFIG_FILE) || {};
    
    // Only expose public fields
    const publicConfig = {
      title: siteConfig.title || 'AAASC',
      description: siteConfig.description || '',
      contact: siteConfig.contact || {},
      social: siteConfig.social || {},
      // Add other public fields as needed
    };
    
    res.json(publicConfig);
  })
);

export default router;
