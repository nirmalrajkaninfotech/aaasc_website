import express from 'express';
import { uploadFile, getFileUrl } from '../utils/fileUpload.js';

const router = express.Router();

// POST /api/upload - Handle file upload
router.post('/', uploadFile('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    
    res.status(201).json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /api/upload/image - Specifically for image uploads
router.post('/image', uploadFile('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Additional image validation if needed
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete the uploaded file if it's not an image
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    
    res.status(201).json({
      success: true,
      image: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
