const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all facilities
router.get('/', (req, res) => {
  const { published } = req.query;
  
  let query = 'SELECT * FROM facilities';
  let params = [];

  if (published !== undefined) {
    query += ' WHERE published = ?';
    params.push(published === 'true' ? 1 : 0);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch facilities' });
    }

    const facilities = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    }));

    res.json(facilities);
  });
});

// Get facility by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM facilities WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch facility' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    };

    res.json(facility);
  });
});

// Create new facility
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('content').optional(),
  body('images').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      content,
      images = [],
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM facilities', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO facilities (
          title, description, content, images, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          description || '',
          content || '',
          JSON.stringify(images),
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create facility' });
          }

          res.status(201).json({
            message: 'Facility created successfully',
            id: this.lastID,
            facility: {
              id: this.lastID,
              title,
              description,
              content,
              images,
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

// Update facility
router.put('/:id', [
  body('title').optional(),
  body('description').optional(),
  body('content').optional(),
  body('images').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM facilities WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      const updatedFacility = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE facilities SET 
          title = ?, description = ?, content = ?, images = ?, 
          published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedFacility.title,
          updatedFacility.description,
          updatedFacility.content,
          updatedFacility.images,
          updatedFacility.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update facility' });
          }

          res.json({
            message: 'Facility updated successfully',
            facility: {
              ...updatedFacility,
              id: parseInt(id),
              images: JSON.parse(updatedFacility.images),
              published: Boolean(updatedFacility.published)
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

// Delete facility
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM facilities WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete facility' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json({ message: 'Facility deleted successfully' });
  });
});

module.exports = router;
