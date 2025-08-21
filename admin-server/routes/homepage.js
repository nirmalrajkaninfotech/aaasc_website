const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get homepage configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "homepage_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch homepage configuration' });
    }

    // Convert rows to object format
    const homepageConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('homepage_', '');
      homepageConfig[key] = row.value;
    });

    // Return structured homepage configuration
    res.json({
      title: homepageConfig.title || 'Welcome to AAASC College',
      subtitle: homepageConfig.subtitle || 'Excellence in Education',
      description: homepageConfig.description || 'Discover the best in education at AAASC College.',
      sections: homepageConfig.sections ? JSON.parse(homepageConfig.sections) : [
        { id: 'hero', title: 'Hero Section', enabled: true, order: 1 },
        { id: 'about', title: 'About Section', enabled: true, order: 2 },
        { id: 'academics', title: 'Academics Section', enabled: true, order: 3 },
        { id: 'facilities', title: 'Facilities Section', enabled: true, order: 4 },
        { id: 'gallery', title: 'Gallery Section', enabled: true, order: 5 },
        { id: 'contact', title: 'Contact Section', enabled: true, order: 6 }
      ],
      hero: {
        title: homepageConfig.hero_title || 'Welcome to AAASC College',
        subtitle: homepageConfig.hero_subtitle || 'Excellence in Education',
        description: homepageConfig.hero_description || 'Discover the best in education at AAASC College.',
        image: homepageConfig.hero_image || '/hero-image.jpg',
        cta_text: homepageConfig.hero_cta_text || 'Learn More',
        cta_link: homepageConfig.hero_cta_link || '/about'
      },
      features: homepageConfig.features ? JSON.parse(homepageConfig.features) : [
        { title: 'Quality Education', description: 'Excellence in teaching and learning', icon: 'graduation-cap' },
        { title: 'Modern Facilities', description: 'State-of-the-art infrastructure', icon: 'building' },
        { title: 'Expert Faculty', description: 'Experienced and qualified teachers', icon: 'users' }
      ]
    });
  });
});

// Update homepage configuration
router.put('/', [
  body('data').isObject().withMessage('Homepage data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store homepage data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `homepage_${key}`;
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
                message: 'Some homepage configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Homepage configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update homepage configuration' });
  }
});

module.exports = router;
