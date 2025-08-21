const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get all academic programs
router.get('/', (req, res) => {
  const { published, section } = req.query;
  
  let query = 'SELECT * FROM academics';
  let params = [];
  let conditions = [];

  if (published !== undefined) {
    conditions.push('published = ?');
    params.push(published === 'true' ? 1 : 0);
  }

  if (section) {
    conditions.push('section = ?');
    params.push(section);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY order_index ASC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch academic programs' });
    }

    const academics = rows.map(row => ({
      ...row,
      published: Boolean(row.published)
    }));

    res.json(academics);
  });
});

// Get academic program by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM academics WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch academic program' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Academic program not found' });
    }

    const academic = {
      ...row,
      published: Boolean(row.published)
    };

    res.json(academic);
  });
});

// Create new academic program
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('section').optional(),
  body('description').optional(),
  body('content').optional(),
  body('duration').optional(),
  body('eligibility').optional(),
  body('syllabus').optional(),
  body('career_prospects').optional(),
  body('image').optional(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      section,
      description,
      content,
      duration,
      eligibility,
      syllabus,
      career_prospects,
      image,
      published = true
    } = req.body;

    // Get next order index
    db.get('SELECT MAX(order_index) as max_order FROM academics', (err, row) => {
      const nextOrder = (row?.max_order || 0) + 1;

      db.run(
        `INSERT INTO academics (
          title, section, description, content, duration, eligibility, 
          syllabus, career_prospects, image, published, order_index, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          section || '',
          description || '',
          content || '',
          duration || '',
          eligibility || '',
          syllabus || '',
          career_prospects || '',
          image || '',
          published ? 1 : 0,
          nextOrder
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create academic program' });
          }

          res.status(201).json({
            message: 'Academic program created successfully',
            id: this.lastID,
            academic: {
              id: this.lastID,
              title,
              section,
              description,
              content,
              duration,
              eligibility,
              syllabus,
              career_prospects,
              image,
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

// Update academic program
router.put('/:id', [
  body('title').optional(),
  body('section').optional(),
  body('description').optional(),
  body('content').optional(),
  body('duration').optional(),
  body('eligibility').optional(),
  body('syllabus').optional(),
  body('career_prospects').optional(),
  body('image').optional(),
  body('published').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    db.get('SELECT * FROM academics WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch academic program' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Academic program not found' });
      }

      const updatedAcademic = {
        ...row,
        ...updates,
        published: updates.published !== undefined ? (updates.published ? 1 : 0) : row.published
      };

      db.run(
        `UPDATE academics SET 
          title = ?, section = ?, description = ?, content = ?, 
          duration = ?, eligibility = ?, syllabus = ?, career_prospects = ?, 
          image = ?, published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          updatedAcademic.title,
          updatedAcademic.section,
          updatedAcademic.description,
          updatedAcademic.content,
          updatedAcademic.duration,
          updatedAcademic.eligibility,
          updatedAcademic.syllabus,
          updatedAcademic.career_prospects,
          updatedAcademic.image,
          updatedAcademic.published,
          id
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update academic program' });
          }

          res.json({
            message: 'Academic program updated successfully',
            academic: {
              ...updatedAcademic,
              id: parseInt(id),
              published: Boolean(updatedAcademic.published)
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

// Delete academic program
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM academics WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete academic program' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Academic program not found' });
    }

    res.json({ message: 'Academic program deleted successfully' });
  });
});

// Get academic sections
router.get('/sections/list', (req, res) => {
  db.all('SELECT DISTINCT section FROM academics WHERE published = 1 AND section IS NOT NULL ORDER BY section', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch academic sections' });
    }

    const sections = rows.map(row => row.section);
    res.json(sections);
  });
});

module.exports = router;
