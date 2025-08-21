const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get IQAC data
router.get('/', (req, res) => {
  db.get('SELECT * FROM site_settings WHERE key LIKE "iqac_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch IQAC data' });
    }

    // For now, return empty IQAC data structure
    // This can be expanded based on your specific IQAC requirements
    res.json({
      title: 'Internal Quality Assurance Cell (IQAC)',
      description: 'Quality assurance and enhancement initiatives',
      objectives: [],
      activities: [],
      reports: [],
      members: []
    });
  });
});

// Update IQAC data
router.put('/', [
  body('data').isObject().withMessage('IQAC data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store IQAC data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `iqac_${key}`;
      db.run(
        'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [settingKey, JSON.stringify(value)],
        function(err) {
          if (err) {
            console.error(`Database error for ${key}:`, err);
            updateErrors.push({ key, error: 'Failed to update' });
          }
          
          completed++;
          
          if (completed === updates.length) {
            if (updateErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some IQAC data failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'IQAC data updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update IQAC data' });
  }
});

module.exports = router;
