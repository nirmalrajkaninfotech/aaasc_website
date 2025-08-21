const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get navigation configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "navigation_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch navigation configuration' });
    }

    // Convert rows to object format
    const navigationConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('navigation_', '');
      navigationConfig[key] = row.value;
    });

    // Return structured navigation configuration
    res.json({
      logo: navigationConfig.logo || '/logo.png',
      logo_text: navigationConfig.logo_text || 'AAASC College',
      menu_items: navigationConfig.menu_items ? JSON.parse(navigationConfig.menu_items) : [
        { id: 'home', title: 'Home', url: '/', order: 1, enabled: true },
        { id: 'about', title: 'About', url: '/about', order: 2, enabled: true },
        { id: 'academics', title: 'Academics', url: '/academics', order: 3, enabled: true },
        { id: 'facilities', title: 'Facilities', url: '/facilities', order: 4, enabled: true },
        { id: 'gallery', title: 'Gallery', url: '/gallery', order: 5, enabled: true },
        { id: 'contact', title: 'Contact', url: '/contact', order: 6, enabled: true }
      ],
      footer_links: navigationConfig.footer_links ? JSON.parse(navigationConfig.footer_links) : [
        { id: 'privacy', title: 'Privacy Policy', url: '/privacy' },
        { id: 'terms', title: 'Terms of Service', url: '/terms' },
        { id: 'sitemap', title: 'Sitemap', url: '/sitemap' }
      ],
      social_links: navigationConfig.social_links ? JSON.parse(navigationConfig.social_links) : [
        { platform: 'facebook', url: '', enabled: false },
        { platform: 'twitter', url: '', enabled: false },
        { platform: 'instagram', url: '', enabled: false },
        { platform: 'linkedin', url: '', enabled: false }
      ]
    });
  });
});

// Update navigation configuration
router.put('/', [
  body('data').isObject().withMessage('Navigation data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store navigation data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `navigation_${key}`;
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
                message: 'Some navigation configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Navigation configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update navigation configuration' });
  }
});

module.exports = router;
