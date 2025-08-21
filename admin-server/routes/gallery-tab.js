const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get gallery tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "gallery_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch gallery tab configuration' });
    }

    // Convert rows to object format
    const galleryTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('gallery_tab_', '');
      galleryTabConfig[key] = row.value;
    });

    // Return structured gallery tab configuration
    res.json({
      title: galleryTabConfig.title || 'Gallery Management',
      description: galleryTabConfig.description || 'Manage your college photo and video gallery',
      categories: galleryTabConfig.categories ? JSON.parse(galleryTabConfig.categories) : [
        { id: 'campus', name: 'Campus Life', icon: 'building', enabled: true },
        { id: 'events', name: 'Events & Celebrations', icon: 'calendar', enabled: true },
        { id: 'academics', name: 'Academic Activities', icon: 'graduation-cap', enabled: true },
        { id: 'sports', name: 'Sports & Athletics', icon: 'futbol', enabled: true },
        { id: 'cultural', name: 'Cultural Activities', icon: 'music', enabled: true },
        { id: 'facilities', name: 'Facilities & Infrastructure', icon: 'wrench', enabled: true },
        { id: 'students', name: 'Student Life', icon: 'users', enabled: true },
        { id: 'faculty', name: 'Faculty & Staff', icon: 'chalkboard-teacher', enabled: true }
      ],
      default_gallery: galleryTabConfig.default_gallery ? JSON.parse(galleryTabConfig.default_gallery) : [
        {
          id: 1,
          title: 'Campus Overview',
          category: 'campus',
          description: 'Beautiful aerial view of our college campus showing the main buildings and green spaces.',
          images: ['/gallery/campus1.jpg', '/gallery/campus2.jpg', '/gallery/campus3.jpg'],
          tags: ['campus', 'aerial', 'buildings', 'green spaces'],
          featured: true,
          order: 1,
          published: true
        },
        {
          id: 2,
          title: 'Annual Day Celebration',
          category: 'events',
          description: 'Highlights from our annual day celebration featuring cultural performances and award ceremonies.',
          images: ['/gallery/annual-day1.jpg', '/gallery/annual-day2.jpg', '/gallery/annual-day3.jpg'],
          tags: ['annual day', 'celebration', 'cultural', 'awards', 'performance'],
          featured: true,
          order: 2,
          published: true
        }
      ],
      settings: {
        show_categories: galleryTabConfig.show_categories !== 'false',
        show_filters: galleryTabConfig.show_filters !== 'false',
        show_search: galleryTabConfig.show_search !== 'false',
        items_per_page: parseInt(galleryTabConfig.items_per_page) || 12,
        show_tags: galleryTabConfig.show_tags !== 'false',
        show_featured_badge: galleryTabConfig.show_featured_badge !== 'false',
        enable_lightbox: galleryTabConfig.enable_lightbox !== 'false',
        enable_slideshow: galleryTabConfig.enable_slideshow !== 'false',
        slideshow_interval: parseInt(galleryTabConfig.slideshow_interval) || 3000,
        image_quality: galleryTabConfig.image_quality || 'high',
        thumbnail_size: galleryTabConfig.thumbnail_size || 'medium',
        enable_download: galleryTabConfig.enable_download !== 'false',
        enable_sharing: galleryTabConfig.enable_sharing !== 'false',
        show_image_count: galleryTabConfig.show_image_count !== 'false',
        enable_category_pages: galleryTabConfig.enable_category_pages !== 'false',
        enable_tag_pages: galleryTabConfig.enable_tag_pages !== 'false',
        max_images_per_item: parseInt(galleryTabConfig.max_images_per_item) || 10,
        enable_video_support: galleryTabConfig.enable_video_support !== 'false',
        allowed_video_formats: galleryTabConfig.allowed_video_formats ? JSON.parse(galleryTabConfig.allowed_video_formats) : ['mp4', 'webm', 'ogg'],
        max_video_size: parseInt(galleryTabConfig.max_video_size) || 100 * 1024 * 1024 // 100MB
      }
    });
  });
});

// Update gallery tab configuration
router.put('/', [
  body('data').isObject().withMessage('Gallery tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store gallery tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `gallery_tab_${key}`;
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
                message: 'Some gallery tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Gallery tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update gallery tab configuration' });
  }
});

module.exports = router;
