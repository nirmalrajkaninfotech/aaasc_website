const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all placements
router.get('/', (req, res) => {
  const { published } = req.query;
  
  let query = 'SELECT * FROM placements';
  let params = [];

  if (published !== undefined) {
    query += ' WHERE published = ?';
    params.push(published === 'true' ? 1 : 0);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch placements' });
    }

    const placements = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    }));

    res.json(placements);
  });
});

// Get placement by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM placements WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch placement' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    const placement = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    };

    res.json(placement);
  });
});

// Create new placement
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
    db.get('SELECT MAX(order_index) as max_order FROM placements', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO placements (
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
            return res.status(500).json({ error: 'Failed to create placement' });
          }

          res.status(201).json({
            message: 'Placement created successfully',
            id: this.lastID,
            placement: {
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

// Update placement
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

    db.get('SELECT * FROM placements WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch placement' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      const updatedPlacement = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE placements SET 
          title = ?, content = ?, images = ?, alignment = ?, 
          published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedPlacement.title,
          updatedPlacement.content,
          updatedPlacement.images,
          updatedPlacement.alignment,
          updatedPlacement.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update placement' });
          }

          res.json({
            message: 'Placement updated successfully',
            placement: {
              ...updatedPlacement,
              id: parseInt(id),
              images: JSON.parse(updatedPlacement.images),
              published: Boolean(updatedPlacement.published)
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

// Delete placement
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM placements WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete placement' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    res.json({ message: 'Placement deleted successfully' });
  });
});

// Reorder placements
router.post('/reorder', [
  body('orders').isArray().withMessage('Orders array is required')
], (req, res) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ errors: validationErrors.array() });
    }

    const { orders } = req.body;
    let completed = 0;
    let reorderErrors = [];

    orders.forEach(({ id, order_index }) => {
      db.run(
        'UPDATE placements SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [order_index, id],
        function(err) {
          if (err) {
            console.error(`Database error for placement ${id}:`, err);
            reorderErrors.push({ id, error: 'Failed to reorder' });
          }
          
          completed++;
          
          if (completed === orders.length) {
            if (reorderErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some placements failed to reorder',
                errors: reorderErrors
              });
            }
            
            res.json({ 
              message: 'Placements reordered successfully',
              reorderedCount: orders.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder placements' });
  }
});

module.exports = router;
