const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all faculty members
router.get('/', (req, res) => {
  const { published } = req.query;
  
  let query = 'SELECT * FROM faculty';
  let params = [];

  if (published !== undefined) {
    query += ' WHERE published = ?';
    params.push(published === 'true' ? 1 : 0);
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch faculty members' });
    }

    const faculty = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    }));

    res.json(faculty);
  });
});

// Get faculty member by slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  db.get('SELECT * FROM faculty WHERE slug = ?', [slug], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch faculty member' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    const facultyMember = {
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      published: Boolean(row.published)
    };

    res.json(facultyMember);
  });
});

// Create new faculty member
router.post('/', [
  body('slug').notEmpty().withMessage('Slug is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('subtitle').optional(),
  body('designation').optional(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('content').optional(),
  body('image').optional(),
  body('images').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      slug,
      title,
      subtitle,
      designation,
      email,
      phone,
      content,
      image,
      images = [],
      published = true
    } = req.body;

    // Check if slug already exists
    db.get('SELECT id FROM faculty WHERE slug = ?', [slug], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to check slug uniqueness' });
      }

      if (existing) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      // Get next order index
      db.get('SELECT MAX(order_index) as max_order FROM faculty', (err, row) => {
        const nextOrder = (row?.max_order || 0) + 1;

        db.run(
          `INSERT INTO faculty (
            slug, title, subtitle, designation, email, phone, content, 
            image, images, published, order_index, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            slug,
            title,
            subtitle || '',
            designation || '',
            email || '',
            phone || '',
            content || '',
            image || '',
            JSON.stringify(images),
            published ? 1 : 0,
            nextOrder
          ],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to create faculty member' });
            }

            res.status(201).json({
              message: 'Faculty member created successfully',
              id: this.lastID,
              faculty: {
                id: this.lastID,
                slug,
                title,
                subtitle,
                designation,
                email,
                phone,
                content,
                image,
                images,
                published,
                order_index: nextOrder
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update faculty member
router.put('/:slug', [
  body('title').optional(),
  body('subtitle').optional(),
  body('designation').optional(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('content').optional(),
  body('image').optional(),
  body('images').optional().isArray(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slug } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM faculty WHERE slug = ?', [slug], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch faculty member' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Faculty member not found' });
      }

      const updatedFaculty = {
        ...row,
        ...updates,
        images: updates.images ? JSON.stringify(updates.images) : row.images,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE faculty SET 
          title = ?, subtitle = ?, designation = ?, email = ?, 
          phone = ?, content = ?, image = ?, images = ?, 
          published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?`,
        [
          updatedFaculty.title,
          updatedFaculty.subtitle,
          updatedFaculty.designation,
          updatedFaculty.email,
          updatedFaculty.phone,
          updatedFaculty.content,
          updatedFaculty.image,
          updatedFaculty.images,
          updatedFaculty.published,
          slug
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update faculty member' });
          }

          res.json({
            message: 'Faculty member updated successfully',
            faculty: {
              ...updatedFaculty,
              slug,
              images: JSON.parse(updatedFaculty.images),
              published: Boolean(updatedFaculty.published)
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

// Delete faculty member
router.delete('/:slug', (req, res) => {
  const { slug } = req.params;

  db.run('DELETE FROM faculty WHERE slug = ?', [slug], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete faculty member' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    res.json({ message: 'Faculty member deleted successfully' });
  });
});

module.exports = router;
