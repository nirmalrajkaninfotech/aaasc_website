const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get about information
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "about_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch about information' });
    }

    // Convert rows to object format
    const aboutInfo = {};
    rows.forEach(row => {
      const key = row.key.replace('about_', '');
      aboutInfo[key] = row.value;
    });

    // Return structured about information
    res.json({
      title: aboutInfo.title || 'About AAASC College',
      subtitle: aboutInfo.subtitle || 'Excellence in Education',
      description: aboutInfo.description || 'AAASC College is committed to providing quality education and fostering academic excellence.',
      mission: aboutInfo.mission || 'Our mission is to empower students with knowledge and skills for a successful future.',
      vision: aboutInfo.vision || 'To be a leading institution of higher learning.',
      values: aboutInfo.values ? JSON.parse(aboutInfo.values) : [
        'Excellence',
        'Integrity',
        'Innovation',
        'Diversity',
        'Community'
      ],
      history: aboutInfo.history || 'Founded with a vision to provide accessible quality education.',
      achievements: aboutInfo.achievements ? JSON.parse(aboutInfo.achievements) : [],
      leadership: aboutInfo.leadership ? JSON.parse(aboutInfo.leadership) : []
    });
  });
});

// Update about information
router.put('/', [
  body('data').isObject().withMessage('About data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store about data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `about_${key}`;
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      db.run(
        'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [settingKey, settingValue],
        function(err) {
          if (err) {
            console.error(`Database error for ${key}:`, err);
            updateErrors.push({ key, error: 'Failed to update' });
          }
          
          completed++;
          
          if (completed === updates.length) {
            if (updateErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some about information failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'About information updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update about information' });
  }
});

module.exports = router;
