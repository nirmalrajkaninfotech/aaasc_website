const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all carousel items
router.get('/', (req, res) => {
  const { published } = req.query;
  
  let query = 'SELECT * FROM carousel';
  let params = [];

  if (published !== undefined) {
    query += ' WHERE published = ?';
    params.push(published === 'true' ? 1 : 0);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch carousel items' });
    }

    const carouselItems = rows.map(row => ({
      ...row,
      published: Boolean(row.published)
    }));

    res.json(carouselItems);
  });
});

// Get carousel item by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM carousel WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch carousel item' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Carousel item not found' });
    }

    const carouselItem = {
      ...row,
      published: Boolean(row.published)
    };

    res.json(carouselItem);
  });
});

// Create new carousel item
router.post('/', [
  body('image').notEmpty().withMessage('Image is required'),
  body('title').optional(),
  body('description').optional(),
  body('caption').optional(),
  body('link').optional(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      image,
      title,
      description,
      caption,
      link,
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM carousel', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO carousel (
          image, title, description, caption, link, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          image,
          title || '',
          description || '',
          caption || '',
          link || '',
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create carousel item' });
          }

          res.status(201).json({
            message: 'Carousel item created successfully',
            id: this.lastID,
            carouselItem: {
              id: this.lastID,
              image,
              title,
              description,
              caption,
              link,
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

// Update carousel item
router.put('/:id', [
  body('image').optional(),
  body('title').optional(),
  body('description').optional(),
  body('caption').optional(),
  body('link').optional(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM carousel WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch carousel item' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Carousel item not found' });
      }

      const updatedCarouselItem = {
        ...row,
        ...updates,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE carousel SET 
          image = ?, title = ?, description = ?, caption = ?, 
          link = ?, published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedCarouselItem.image,
          updatedCarouselItem.title,
          updatedCarouselItem.description,
          updatedCarouselItem.caption,
          updatedCarouselItem.link,
          updatedCarouselItem.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update carousel item' });
          }

          res.json({
            message: 'Carousel item updated successfully',
            carouselItem: {
              ...updatedCarouselItem,
              id: parseInt(id),
              published: Boolean(updatedCarouselItem.published)
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

// Delete carousel item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM carousel WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete carousel item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Carousel item not found' });
    }

    res.json({ message: 'Carousel item deleted successfully' });
  });
});

module.exports = router;
