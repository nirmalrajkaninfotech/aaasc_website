import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadFile, getFileUrl, deleteFile } from '../utils/fileUpload.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const GALLERY_FILE = 'gallery';

// GET /api/gallery - Get all gallery items
router.get('/', 
  asyncHandler(async (req, res) => {
    const gallery = readJsonFile(GALLERY_FILE) || [];
    res.json(gallery);
  })
);

// POST /api/gallery - Add new gallery item (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'editor']),
  uploadFile('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { title, description, category } = req.body;
    const gallery = readJsonFile(GALLERY_FILE) || [];
    
    const newItem = {
      id: Date.now().toString(),
      title: title || 'Untitled',
      description: description || '',
      category: category || 'uncategorized',
      image: req.file.filename,
      imageUrl: getFileUrl(req, req.file.filename),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    gallery.push(newItem);
    writeJsonFile(GALLERY_FILE, gallery);

    res.status(201).json(newItem);
  })
);

// PUT /api/gallery/:id - Update gallery item (protected)
router.put('/:id', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    const gallery = readJsonFile(GALLERY_FILE) || [];
    const itemIndex = gallery.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const updatedItem = {
      ...gallery[itemIndex],
      title: title || gallery[itemIndex].title,
      description: description !== undefined ? description : gallery[itemIndex].description,
      category: category || gallery[itemIndex].category,
      updatedAt: new Date().toISOString()
    };

    gallery[itemIndex] = updatedItem;
    writeJsonFile(GALLERY_FILE, gallery);

    res.json(updatedItem);
  })
);

// DELETE /api/gallery/:id - Delete gallery item (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const gallery = readJsonFile(GALLERY_FILE) || [];
    const itemIndex = gallery.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Delete the associated image file
    const item = gallery[itemIndex];
    if (item.image) {
      deleteFile(item.image);
    }

    // Remove the item from the gallery
    gallery.splice(itemIndex, 1);
    writeJsonFile(GALLERY_FILE, gallery);

    res.json({ success: true, message: 'Gallery item deleted successfully' });
  })
);

// GET /api/gallery/categories - Get all gallery categories
router.get('/categories', 
  asyncHandler(async (req, res) => {
    const gallery = readJsonFile(GALLERY_FILE) || [];
    const categories = [...new Set(gallery.map(item => item.category).filter(Boolean))];
    res.json(categories);
  })
);

export default router;
