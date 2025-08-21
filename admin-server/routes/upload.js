const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Create clean filename
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${timestamp}_${cleanName}_${uniqueId}${ext}`;
    
    cb(null, filename);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: imageFilter
});

// Single file upload
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.user.id;

    // Process image if it's an image
    let processedPath = file.path;
    let thumbnailPath = null;

    if (file.mimetype.startsWith('image/')) {
      try {
        // Create thumbnail
        const thumbnailName = `thumb_${path.basename(file.filename)}`;
        thumbnailPath = path.join(uploadsDir, thumbnailName);
        
        await sharp(file.path)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        // Optimize original image
        const optimizedName = `opt_${path.basename(file.filename)}`;
        const optimizedPath = path.join(uploadsDir, optimizedName);
        
        await sharp(file.path)
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Replace original with optimized
        await fs.unlink(file.path);
        processedPath = optimizedPath;
        file.filename = optimizedName;
      } catch (error) {
        console.warn('Image processing failed:', error);
        // Continue with original file if processing fails
      }
    }

    // Save file info to database
    const relativePath = path.relative(path.join(__dirname, '../../'), processedPath);
    
    db.run(
      `INSERT INTO uploads (
        filename, original_name, mime_type, size, path, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        relativePath,
        userId
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save file info' });
        }

        res.json({
          message: 'File uploaded successfully',
          file: {
            id: this.lastID,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: relativePath,
            url: `/uploads/${file.filename}`,
            thumbnail: thumbnailPath ? `/uploads/thumb_${file.filename}` : null
          }
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Multiple files upload
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files;
    const userId = req.user.id;
    const uploadedFiles = [];
    let processedCount = 0;

    files.forEach(async (file, index) => {
      try {
        // Process image if it's an image
        let processedPath = file.path;
        let thumbnailPath = null;

        if (file.mimetype.startsWith('image/')) {
          try {
            // Create thumbnail
            const thumbnailName = `thumb_${path.basename(file.filename)}`;
            thumbnailPath = path.join(uploadsDir, thumbnailName);
            
            await sharp(file.path)
              .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toFile(thumbnailPath);

            // Optimize original image
            const optimizedName = `opt_${path.basename(file.filename)}`;
            const optimizedPath = path.join(uploadsDir, optimizedName);
            
            await sharp(file.path)
              .jpeg({ quality: 85 })
              .toFile(optimizedPath);

            // Replace original with optimized
            await fs.unlink(file.path);
            processedPath = optimizedPath;
            file.filename = optimizedName;
          } catch (error) {
            console.warn('Image processing failed:', error);
          }
        }

        // Save file info to database
        const relativePath = path.relative(path.join(__dirname, '../../'), processedPath);
        
        db.run(
          `INSERT INTO uploads (
            filename, original_name, mime_type, size, path, uploaded_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            relativePath,
            userId
          ],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return;
            }

            uploadedFiles.push({
              id: this.lastID,
              filename: file.filename,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              path: relativePath,
              url: `/uploads/${file.filename}`,
              thumbnail: thumbnailPath ? `/uploads/thumb_${file.filename}` : null
            });

            processedCount++;
            
            if (processedCount === files.length) {
              res.json({
                message: 'Files uploaded successfully',
                files: uploadedFiles,
                count: uploadedFiles.length
              });
            }
          }
        );
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        processedCount++;
        
        if (processedCount === files.length) {
          res.json({
            message: 'Files uploaded with some errors',
            files: uploadedFiles,
            count: uploadedFiles.length,
            errors: true
          });
        }
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Multiple file upload failed' });
  }
});

// Get uploaded files
router.get('/', (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM uploads';
  let countQuery = 'SELECT COUNT(*) as total FROM uploads';
  let params = [];
  let countParams = [];

  if (type) {
    query += ' WHERE mime_type LIKE ?';
    countQuery += ' WHERE mime_type LIKE ?';
    params.push(`%${type}%`);
    countParams.push(`%${type}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count
  db.get(countQuery, countParams, (err, countRow) => {
    if (err) {
      console.error('Count error:', err);
      return res.status(500).json({ error: 'Failed to get file count' });
    }

    // Get files
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch files' });
      }

      const files = rows.map(row => ({
        ...row,
        url: `/uploads/${row.filename}`,
        thumbnail: row.mime_type.startsWith('image/') ? `/uploads/thumb_${row.filename}` : null
      }));

      res.json({
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow.total,
          pages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// Delete uploaded file
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Get file info before deletion
  db.get('SELECT * FROM uploads WHERE id = ?', [id], async (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch file' });
    }

    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '../../', row.path);
      await fs.unlink(filePath);

      // Delete thumbnail if exists
      if (row.mime_type.startsWith('image/')) {
        const thumbnailPath = path.join(__dirname, '../../uploads/thumb_', path.basename(row.filename));
        await fs.unlink(thumbnailPath).catch(() => {}); // Ignore if thumbnail doesn't exist
      }
    } catch (error) {
      console.warn('Failed to delete file from filesystem:', error);
    }

    // Delete from database
    db.run('DELETE FROM uploads WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      res.json({ message: 'File deleted successfully' });
    });
  });
});

// Get file by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM uploads WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch file' });
    }

    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = {
      ...row,
      url: `/uploads/${row.filename}`,
      thumbnail: row.mime_type.startsWith('image/') ? `/uploads/thumb_${row.filename}` : null
    };

    res.json(file);
  });
});

module.exports = router;
