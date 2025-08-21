const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get contact information
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "contact_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch contact information' });
    }

    // Convert rows to object format
    const contactInfo = {};
    rows.forEach(row => {
      const key = row.key.replace('contact_', '');
      contactInfo[key] = row.value;
    });

    // Return structured contact information
    res.json({
      address: contactInfo.address || '123 College Street, City, State',
      phone: contactInfo.phone || '+1 234 567 8900',
      email: contactInfo.email || 'info@aaasc.edu',
      website: contactInfo.website || 'https://aaasc.edu',
      hours: contactInfo.hours || 'Monday - Friday: 9:00 AM - 5:00 PM',
      social: {
        facebook: contactInfo.facebook || '',
        twitter: contactInfo.twitter || '',
        instagram: contactInfo.instagram || '',
        linkedin: contactInfo.linkedin || ''
      }
    });
  });
});

// Update contact information
router.put('/', [
  body('data').isObject().withMessage('Contact data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store contact data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `contact_${key}`;
      db.run(
        'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [settingKey, value],
        function(err) {
          if (err) {
            console.error(`Database error for ${key}:`, err);
            updateErrors.push({ key, error: 'Failed to update' });
          }
          
          completed++;
          
          if (completed === updates.length) {
            if (updateErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some contact information failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Contact information updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update contact information' });
  }
});

module.exports = router;
