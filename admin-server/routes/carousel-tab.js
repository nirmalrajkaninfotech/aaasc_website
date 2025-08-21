const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get carousel tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "carousel_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch carousel tab configuration' });
    }

    // Convert rows to object format
    const carouselTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('carousel_tab_', '');
      carouselTabConfig[key] = row.value;
    });

    // Return structured carousel tab configuration
    res.json({
      title: carouselTabConfig.title || 'Carousel Management',
      description: carouselTabConfig.description || 'Manage your website carousel slides',
      settings: {
        autoplay: carouselTabConfig.autoplay === 'true',
        autoplay_speed: parseInt(carouselTabConfig.autoplay_speed) || 5000,
        show_indicators: carouselTabConfig.show_indicators !== 'false',
        show_controls: carouselTabConfig.show_controls !== 'false',
        transition_effect: carouselTabConfig.transition_effect || 'slide'
      },
      default_slides: carouselTabConfig.default_slides ? JSON.parse(carouselTabConfig.default_slides) : [
        {
          id: 1,
          title: 'Welcome to AAASC College',
          subtitle: 'Excellence in Education',
          description: 'Discover the best in education at AAASC College.',
          image: '/slide1.jpg',
          link: '/about',
          button_text: 'Learn More',
          order: 1,
          enabled: true
        }
      ]
    });
  });
});

// Update carousel tab configuration
router.put('/', [
  body('data').isObject().withMessage('Carousel tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store carousel tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `carousel_tab_${key}`;
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
                message: 'Some carousel tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Carousel tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update carousel tab configuration' });
  }
});

module.exports = router;
