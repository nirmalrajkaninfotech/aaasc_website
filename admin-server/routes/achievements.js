const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all achievements
router.get('/', (req, res) => {
  const { published } = req.query;
  
  let query = 'SELECT * FROM achievements';
  let params = [];

  if (published !== undefined) {
    query += ' WHERE published = ?';
    params.push(published === 'true' ? 1 : 0);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch achievements' });
    }

    const achievements = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    }));

    res.json(achievements);
  });
});

// Get achievement by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM achievements WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch achievement' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const achievement = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    };

    res.json(achievement);
  });
});

// Create new achievement
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').optional(),
  body('images').optional().isArray(),
  body('alignment').optional().isIn(['left', 'center', 'right']),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      images = [],
      alignment = 'left',
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM achievements', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO achievements (
          title, content, images, alignment, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          content || '',
          JSON.stringify(images),
          alignment,
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create achievement' });
          }

          res.status(201).json({
            message: 'Achievement created successfully',
            id: this.lastID,
            achievement: {
              id: this.lastID,
              title,
              content,
              images,
              alignment,
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

// Update achievement
router.put('/:id', [
  body('title').optional(),
  body('content').optional(),
  body('images').optional().isArray(),
  body('alignment').optional().isIn(['left', 'center', 'right']),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM achievements WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch achievement' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Achievement not found' });
      }

      const updatedAchievement = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE achievements SET 
          title = ?, content = ?, images = ?, alignment = ?, 
          published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedAchievement.title,
          updatedAchievement.content,
          updatedAchievement.images,
          updatedAchievement.alignment,
          updatedAchievement.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update achievement' });
          }

          res.json({
            message: 'Achievement updated successfully',
            achievement: {
              ...updatedAchievement,
              id: parseInt(id),
              images: JSON.parse(updatedAchievement.images),
              published: Boolean(updatedAchievement.published)
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

// Delete achievement
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM achievements WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete achievement' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ message: 'Achievement deleted successfully' });
  });
});

module.exports = router;
