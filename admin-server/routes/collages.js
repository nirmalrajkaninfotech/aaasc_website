const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Get all collages
router.get('/', (req, res) => {
  const { category, featured, published } = req.query;
  
  let query = 'SELECT * FROM collages';
  let params = [];
  let conditions = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (featured !== undefined) {
    conditions.push('featured = ?');
    params.push(featured === 'true' ? 1 : 0);
  }

  if (published !== undefined) {
    conditions.push('published = ?');
    params.push(published === 'true' ? 1 : 0);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch collages' });
    }

    // Parse images JSON if exists
    const collages = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      featured: Boolean(row.featured),
      published: Boolean(row.published)
    }));

    res.json(collages);
  });
});

// Get collage by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM collages WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch collage' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Collage not found' });
    }

    // Parse JSON fields
    const collage = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      featured: Boolean(row.featured),
      published: Boolean(row.published)
    };

    res.json(collage);
  });
});

// Create new collage
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').optional(),
  body('images').optional().isArray(),
  body('featured').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('date').optional(),
  body('published').optional().isBoolean(),
  body('order_index').optional().isInt()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      images = [],
      featured = false,
      tags = [],
      date,
      published = true,
      order_index = 0
    } = req.body;

    // Get next order index if not provided
    if (order_index === 0) {
      db.get('SELECT MAX(order_index) as max_order FROM collages', (err, row) => {
        const nextOrder = (row?.max_order || 0) + 1;
        insertCollage(nextOrder);
      });
    } else {
      insertCollage(order_index);
    }

    function insertCollage(orderIndex) {
      db.run(
        `INSERT INTO collages (
          title, description, category, images, featured, tags, date, 
          published, order_index, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          description || '',
          category,
          JSON.stringify(images),
          featured ? 1 : 0,
          JSON.stringify(tags),
          date || '',
          published ? 1 : 0,
          orderIndex
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create collage' });
          }

          res.status(201).json({
            message: 'Collage created successfully',
            id: this.lastID,
            collage: {
              id: this.lastID,
              title,
              description,
              category,
              images,
              featured,
              tags,
              date,
              published,
              order_index: orderIndex
            }
          });
        }
      );
    }
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update collage
router.put('/:id', [
  body('title').optional(),
  body('description').optional(),
  body('category').optional(),
  body('images').optional().isArray(),
  body('featured').optional().isBoolean(),
  body('tags').optional().isArray(),
  body('date').optional(),
  body('published').optional().isBoolean(),
  body('order_index').optional().isInt()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Get current collage
    db.get('SELECT * FROM collages WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch collage' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Collage not found' });
      }

      // Merge updates with current data
      const updatedCollage = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        tags: updates.tags ? JSON.stringify(updates.tags) : row.tags,
        featured: updates.featured !== undefined ? (updates.featured ? 1 : 0) : row.featured,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      // Update collage
      db.run(
        `UPDATE collages SET 
          title = ?, description = ?, category = ?, images = ?, 
          featured = ?, tags = ?, date = ?, published = ?, 
          order_index = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedCollage.title,
          updatedCollage.description,
          updatedCollage.category,
          updatedCollage.images,
          updatedCollage.featured,
          updatedCollage.tags,
          updatedCollage.date,
          updatedCollage.published,
          updatedCollage.order_index,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update collage' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Collage not found' });
          }

          res.json({
            message: 'Collage updated successfully',
            collage: {
              ...updatedCollage,
              id: parseInt(id),
              images: JSON.parse(updatedCollage.images),
              tags: JSON.parse(updatedCollage.tags),
              featured: Boolean(updatedCollage.featured),
              published: Boolean(updatedCollage.published)
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

// Delete collage
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Get collage images before deletion
  db.get('SELECT images FROM collages WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch collage' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Collage not found' });
    }

    // Delete collage from database
    db.run('DELETE FROM collages WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete collage' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Collage not found' });
      }

      // Optionally delete associated images from filesystem
      if (row.images) {
        try {
          const images = JSON.parse(row.images);
          images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '../../public/uploads', imagePath);
            fs.unlink(fullPath).catch(err => {
              console.warn(`Failed to delete image: ${fullPath}`, err);
            });
          });
        } catch (error) {
          console.warn('Failed to parse images for deletion:', error);
        }
      }

      res.json({ message: 'Collage deleted successfully' });
    });
  });
});

// Reorder collages
router.post('/reorder', [
  body('orders').isArray().withMessage('Orders array is required')
], (req, res) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Invalid orders format' });
    }

    let completed = 0;
    let reorderErrors = [];

    orders.forEach(({ id, order_index }) => {
      db.run(
        'UPDATE collages SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [order_index, id],
        function(err) {
          if (err) {
            console.error(`Database error for collage ${id}:`, err);
            reorderErrors.push({ id, error: 'Failed to reorder' });
          }
          
          completed++;
          
          if (completed === orders.length) {
            if (reorderErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some collages failed to reorder',
                errors: reorderErrors
              });
            }
            
            res.json({ 
              message: 'Collages reordered successfully',
              reorderedCount: orders.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder collages' });
  }
});

// Export collages to JSON file
router.post('/export', async (req, res) => {
  try {
    db.all('SELECT * FROM collages ORDER BY order_index ASC', async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch collages' });
      }

      // Parse JSON fields
      const collages = rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        tags: row.tags ? JSON.parse(row.tags) : [],
        featured: Boolean(row.featured),
        published: Boolean(row.published)
      }));

      // Write to JSON file
      const dataPath = path.join(__dirname, '../../data/collages.json');
      await fs.writeFile(dataPath, JSON.stringify(collages, null, 2));

      res.json({ 
        message: 'Collages exported successfully',
        collages,
        exportedTo: dataPath
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export collages' });
  }
});

// Get collage categories
router.get('/categories/list', (req, res) => {
  db.all('SELECT DISTINCT category FROM collages WHERE published = 1 ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

module.exports = router;
