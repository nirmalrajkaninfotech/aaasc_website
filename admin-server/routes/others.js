const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all other content items
router.get('/', (req, res) => {
  const { published, type } = req.query;
  
  let query = 'SELECT * FROM others';
  let params = [];
  let conditions = [];

  if (published !== undefined) {
    conditions.push('published = ?');
    params.push(published === 'true' ? 1 : 0);
  }

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch other content items' });
    }

    const others = rows.map(row => ({
      ...row,
      content: row.content ? JSON.parse(row.content) : {},
      published: Boolean(row.published)
    }));

    res.json(others);
  });
});

// Get other content item by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM others WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch other content item' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Other content item not found' });
    }

    const other = {
      ...row,
      content: row.content ? JSON.parse(row.content) : {},
      published: Boolean(row.published)
    };

    res.json(other);
  });
});

// Create new other content item
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').optional(),
  body('content').optional().isObject(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      type,
      content = {},
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM others', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO others (
          title, type, content, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          type || '',
          JSON.stringify(content),
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create other content item' });
          }

          res.status(201).json({
            message: 'Other content item created successfully',
            id: this.lastID,
            other: {
              id: this.lastID,
              title,
              type,
              content,
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

// Update other content item
router.put('/:id', [
  body('title').optional(),
  body('type').optional(),
  body('content').optional().isObject(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM others WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch other content item' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Other content item not found' });
      }

      const updatedOther = {
        ...row,
        ...updates,
        content: updates.content ? JSON.stringify(updates.content) : row.content,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE others SET 
          title = ?, type = ?, content = ?, published = ?, 
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedOther.title,
          updatedOther.type,
          updatedOther.content,
          updatedOther.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update other content item' });
          }

          res.json({
            message: 'Other content item updated successfully',
            other: {
              ...updatedOther,
              id: parseInt(id),
              content: JSON.parse(updatedOther.content),
              published: Boolean(updatedOther.published)
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

// Delete other content item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM others WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete other content item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Other content item not found' });
    }

    res.json({ message: 'Other content item deleted successfully' });
  });
});

module.exports = router;
