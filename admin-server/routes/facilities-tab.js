const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get facilities tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "facilities_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch facilities tab configuration' });
    }

    // Convert rows to object format
    const facilitiesTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('facilities_tab_', '');
      facilitiesTabConfig[key] = row.value;
    });

    // Return structured facilities tab configuration
    res.json({
      title: facilitiesTabConfig.title || 'Facilities Management',
      description: facilitiesTabConfig.description || 'Manage your college facilities and infrastructure',
      categories: facilitiesTabConfig.categories ? JSON.parse(facilitiesTabConfig.categories) : [
        { id: 'academic', name: 'Academic Facilities', icon: 'graduation-cap', enabled: true },
        { id: 'library', name: 'Library', icon: 'book', enabled: true },
        { id: 'laboratory', name: 'Laboratories', icon: 'flask', enabled: true },
        { id: 'sports', name: 'Sports & Recreation', icon: 'futbol', enabled: true },
        { id: 'technology', name: 'Technology', icon: 'laptop', enabled: true },
        { id: 'medical', name: 'Medical Facilities', icon: 'heartbeat', enabled: true },
        { id: 'transport', name: 'Transportation', icon: 'bus', enabled: true },
        { id: 'cafeteria', name: 'Cafeteria', icon: 'utensils', enabled: true }
      ],
      default_facilities: facilitiesTabConfig.default_facilities ? JSON.parse(facilitiesTabConfig.default_facilities) : [
        {
          id: 1,
          title: 'Central Library',
          category: 'library',
          description: 'A comprehensive library with a vast collection of books, journals, and digital resources.',
          content: 'Our central library houses over 50,000 books, 100+ journals, and provides access to various online databases. Students can access study spaces, computer terminals, and printing services.',
          images: ['/facilities/library1.jpg', '/facilities/library2.jpg'],
          features: ['Study Rooms', 'Computer Terminals', 'Printing Services', 'Online Databases', 'Quiet Zones'],
          capacity: '200 students',
          location: 'Main Building, Ground Floor',
          contact: 'library@aaasc.edu',
          hours: 'Monday - Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 5:00 PM',
          order: 1,
          published: true
        },
        {
          id: 2,
          title: 'Computer Science Lab',
          category: 'laboratory',
          description: 'State-of-the-art computer laboratory equipped with modern hardware and software.',
          content: 'Our CS lab features 50 high-performance computers, latest software development tools, and networking equipment. Students can work on programming projects, web development, and database management.',
          images: ['/facilities/cslab1.jpg', '/facilities/cslab2.jpg'],
          features: ['50 High-Performance PCs', 'Latest Software', 'Networking Equipment', 'Projector System', 'Air Conditioning'],
          capacity: '50 students',
          location: 'Technology Building, 2nd Floor',
          contact: 'cs-lab@aaasc.edu',
          hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
          order: 2,
          published: true
        }
      ],
      settings: {
        show_categories: facilitiesTabConfig.show_categories !== 'false',
        show_filters: facilitiesTabConfig.show_filters !== 'false',
        show_search: facilitiesTabConfig.show_search !== 'false',
        items_per_page: parseInt(facilitiesTabConfig.items_per_page) || 12,
        show_contact_info: facilitiesTabConfig.show_contact_info !== 'false',
        show_hours: facilitiesTabConfig.show_hours !== 'false',
        show_capacity: facilitiesTabConfig.show_capacity !== 'false',
        show_location: facilitiesTabConfig.show_location !== 'false'
      }
    });
  });
});

// Update facilities tab configuration
router.put('/', [
  body('data').isObject().withMessage('Facilities tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store facilities tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `facilities_tab_${key}`;
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
                message: 'Some facilities tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Facilities tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update facilities tab configuration' });
  }
});

module.exports = router;
