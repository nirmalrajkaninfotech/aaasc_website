const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all gallery items
router.get('/', (req, res) => {
  const { published, category } = req.query;
  
  let query = 'SELECT * FROM gallery';
  let params = [];
  let conditions = [];

  if (published !== undefined) {
    conditions.push('published = ?');
    params.push(published === 'true' ? 1 : 0);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch gallery items' });
    }

    const galleryItems = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      published: Boolean(row.published)
    }));

    res.json(galleryItems);
  });
});

// Get gallery item by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM gallery WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch gallery item' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const galleryItem = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      published: Boolean(row.published)
    };

    res.json(galleryItem);
  });
});

// Create new gallery item
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').optional(),
  body('description').optional(),
  body('images').optional().isArray(),
  body('tags').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      category,
      description,
      images = [],
      tags = [],
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM gallery', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO gallery (
          title, category, description, images, tags, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          category || '',
          description || '',
          JSON.stringify(images),
          JSON.stringify(tags),
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create gallery item' });
          }

          res.status(201).json({
            message: 'Gallery item created successfully',
            id: this.lastID,
            galleryItem: {
              id: this.lastID,
              title,
              category,
              description,
              images,
              tags,
              published,
              order_index: nextOrder
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update gallery item
router.put('/:id', [
  body('title').optional(),
  body('category').optional(),
  body('description').optional(),
  body('images').optional().isArray(),
  body('tags').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM gallery WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch gallery item' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }

      const updatedGalleryItem = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        tags: updates.tags ? JSON.stringify(updates.tags) : row.tags,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE gallery SET 
          title = ?, category = ?, description = ?, images = ?, 
          tags = ?, published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedGalleryItem.title,
          updatedGalleryItem.category,
          updatedGalleryItem.description,
          updatedGalleryItem.images,
          updatedGalleryItem.tags,
          updatedGalleryItem.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update gallery item' });
          }

          res.json({
            message: 'Gallery item updated successfully',
            galleryItem: {
              ...updatedGalleryItem,
              id: parseInt(id),
              images: JSON.parse(updatedGalleryItem.images),
              tags: JSON.parse(updatedGalleryItem.tags),
              published: Boolean(updatedGalleryItem.published)
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete gallery item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM gallery WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete gallery item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json({ message: 'Gallery item deleted successfully' });
  });
});

// Get gallery categories
router.get('/categories/list', (req, res) => {
  db.all('SELECT DISTINCT category FROM gallery WHERE published = 1 AND category IS NOT NULL ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch gallery categories' });
    }

    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

module.exports = router;
