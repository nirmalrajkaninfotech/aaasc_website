const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get navigation tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "navigation_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch navigation tab configuration' });
    }

    // Convert rows to object format
    const navigationTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('navigation_tab_', '');
      navigationTabConfig[key] = row.value;
    });

    // Return structured navigation tab configuration
    res.json({
      title: navigationTabConfig.title || 'Navigation Management',
      description: navigationTabConfig.description || 'Manage your website navigation structure',
      header: {
        logo: navigationTabConfig.header_logo || '/logo.png',
        logo_text: navigationTabConfig.header_logo_text || 'AAASC College',
        show_search: navigationTabConfig.header_show_search !== 'false',
        search_placeholder: navigationTabConfig.header_search_placeholder || 'Search...',
        show_language_switcher: navigationTabConfig.header_show_language !== 'false',
        languages: navigationTabConfig.header_languages ? JSON.parse(navigationTabConfig.header_languages) : [
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'ta', name: 'Tamil', flag: '🇮🇳' }
        ]
      },
      main_menu: {
        items: navigationTabConfig.main_menu_items ? JSON.parse(navigationTabConfig.main_menu_items) : [
          { id: 'home', title: 'Home', url: '/', order: 1, enabled: true, children: [] },
          { id: 'about', title: 'About', url: '/about', order: 2, enabled: true, children: [
            { id: 'about-college', title: 'About College', url: '/about' },
            { id: 'about-history', title: 'History', url: '/about#history' },
            { id: 'about-mission', title: 'Mission & Vision', url: '/about#mission' }
          ]},
          { id: 'academics', title: 'Academics', url: '/academics', order: 3, enabled: true, children: [
            { id: 'academics-programs', title: 'Programs', url: '/academics' },
            { id: 'academics-departments', title: 'Departments', url: '/academics#departments' },
            { id: 'academics-admissions', title: 'Admissions', url: '/academics#admissions' }
          ]},
          { id: 'facilities', title: 'Facilities', url: '/facilities', order: 4, enabled: true, children: [] },
          { id: 'gallery', title: 'Gallery', url: '/gallery', order: 5, enabled: true, children: [] },
          { id: 'contact', title: 'Contact', url: '/contact', order: 6, enabled: true, children: [] }
        ],
        max_depth: parseInt(navigationTabConfig.main_menu_max_depth) || 2,
        show_icons: navigationTabConfig.main_menu_show_icons !== 'false'
      },
      footer: {
        columns: navigationTabConfig.footer_columns ? JSON.parse(navigationTabConfig.footer_columns) : [
          {
            title: 'Quick Links',
            links: [
              { title: 'Home', url: '/' },
              { title: 'About', url: '/about' },
              { title: 'Academics', url: '/academics' },
              { title: 'Contact', url: '/contact' }
            ]
          },
          {
            title: 'Academics',
            links: [
              { title: 'Programs', url: '/academics' },
              { title: 'Admissions', url: '/academics#admissions' },
              { title: 'Student Life', url: '/student-life' },
              { title: 'Library', url: '/facilities/library' }
            ]
          },
          {
            title: 'Support',
            links: [
              { title: 'Help Center', url: '/help' },
              { title: 'Contact Us', url: '/contact' },
              { title: 'Privacy Policy', url: '/privacy' },
              { title: 'Terms of Service', url: '/terms' }
            ]
          }
        ],
        bottom_bar: {
          copyright_text: navigationTabConfig.footer_copyright || '© 2025 AAASC College. All rights reserved.',
          show_social_links: navigationTabConfig.footer_show_social !== 'false',
          social_links: navigationTabConfig.footer_social_links ? JSON.parse(navigationTabConfig.footer_social_links) : [
            { platform: 'facebook', url: '', icon: 'facebook', enabled: false },
            { platform: 'twitter', url: '', icon: 'twitter', enabled: false },
            { platform: 'instagram', url: '', icon: 'instagram', enabled: false },
            { platform: 'linkedin', url: '', icon: 'linkedin', enabled: false }
          ]
        }
      },
      mobile: {
        show_hamburger: navigationTabConfig.mobile_show_hamburger !== 'false',
        hamburger_icon: navigationTabConfig.mobile_hamburger_icon || '☰',
        show_search_in_menu: navigationTabConfig.mobile_show_search !== 'false',
        menu_animation: navigationTabConfig.mobile_menu_animation || 'slide'
      }
    });
  });
});

// Update navigation tab configuration
router.put('/', [
  body('data').isObject().withMessage('Navigation tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store navigation tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `navigation_tab_${key}`;
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
                message: 'Some navigation tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Navigation tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update navigation tab configuration' });
  }
});

module.exports = router;
