import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const HEADER3_FILE = 'header3';

// Default header structure
const defaultHeader = {
  id: 'main-header',
  logo: '/images/logo.png',
  contactInfo: {
    email: 'info@college.edu',
    phone: '+1 234 567 8900'
  },
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' }
  ],
  mainMenu: [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about' },
    { 
      title: 'Academics', 
      url: '#',
      children: [
        { title: 'Programs', url: '/academics/programs' },
        { title: 'Departments', url: '/academics/departments' }
      ]
    }
  ],
  announcement: {
    text: 'Admissions open for 2024-25',
    isActive: true,
    link: '/admissions'
  },
  updatedAt: new Date().toISOString()
};

// Helper function to get header data
const getHeaderData = () => {
  const data = readJsonFile(HEADER3_FILE);
  return data || { ...defaultHeader };
};

// GET /api/header3 - Get header data (public)
router.get('/', 
  asyncHandler(async (req, res) => {
    const headerData = getHeaderData();
    res.json(headerData);
  })
);

// POST /api/header3 - Update header data (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const updates = req.body;
    const currentData = getHeaderData();
    
    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(HEADER3_FILE, updatedData);
    
    res.json({
      success: true,
      message: 'Header updated successfully'
    });
  })
);

// Social Links Endpoints

// POST /api/header3/social - Add/update social link (protected)
router.post('/social', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const { platform, url } = req.body;
    const headerData = getHeaderData();
    
    const socialLinks = [...(headerData.socialLinks || [])];
    const existingIndex = socialLinks.findIndex(
      link => link.platform === platform
    );
    
    const newLink = { platform, url };
    
    if (existingIndex >= 0) {
      socialLinks[existingIndex] = newLink;
    } else {
      socialLinks.push(newLink);
    }
    
    headerData.socialLinks = socialLinks;
    headerData.updatedAt = new Date().toISOString();
    
    writeJsonFile(HEADER3_FILE, headerData);
    
    res.status(200).json({
      success: true,
      message: 'Social link updated'
    });
  })
);

// Menu Management Endpoints

// POST /api/header3/menu - Add/update menu item (protected)
router.post('/menu', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const { id, title, url, parentId } = req.body;
    const headerData = getHeaderData();
    
    const menuItems = [...(headerData.mainMenu || [])];
    
    if (parentId) {
      // Add/update child menu item
      const parent = findMenuItem(menuItems, parentId);
      if (!parent) {
        return res.status(404).json({ error: 'Parent menu not found' });
      }
      
      if (!parent.children) parent.children = [];
      
      const existingChildIndex = parent.children.findIndex(
        item => item.id === id || item.title === title
      );
      
      const newItem = { id: id || `menu-${Date.now()}`, title, url };
      
      if (existingChildIndex >= 0) {
        parent.children[existingChildIndex] = newItem;
      } else {
        parent.children.push(newItem);
      }
    } else {
      // Add/update top-level menu item
      const existingIndex = menuItems.findIndex(
        item => item.id === id || item.title === title
      );
      
      const newItem = { 
        id: id || `menu-${Date.now()}`,
        title,
        url,
        children: []
      };
      
      if (existingIndex >= 0) {
        // Preserve existing children if any
        if (menuItems[existingIndex].children) {
          newItem.children = menuItems[existingIndex].children;
        }
        menuItems[existingIndex] = newItem;
      } else {
        menuItems.push(newItem);
      }
    }
    
    headerData.mainMenu = menuItems;
    headerData.updatedAt = new Date().toISOString();
    
    writeJsonFile(HEADER3_FILE, headerData);
    
    res.status(200).json({
      success: true,
      message: 'Menu updated'
    });
  })
);

// Helper function to find menu item by ID
function findMenuItem(menuItems, id) {
  for (const item of menuItems) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findMenuItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default router;
