const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get achievements tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "achievements_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch achievements tab configuration' });
    }

    // Convert rows to object format
    const achievementsTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('achievements_tab_', '');
      achievementsTabConfig[key] = row.value;
    });

    // Return structured achievements tab configuration
    res.json({
      title: achievementsTabConfig.title || 'Achievements Management',
      description: achievementsTabConfig.description || 'Manage your college achievements and recognitions',
      categories: achievementsTabConfig.categories ? JSON.parse(achievementsTabConfig.categories) : [
        { id: 'academic', name: 'Academic Excellence', icon: 'graduation-cap', enabled: true },
        { id: 'research', name: 'Research & Innovation', icon: 'microscope', enabled: true },
        { id: 'sports', name: 'Sports & Athletics', icon: 'trophy', enabled: true },
        { id: 'cultural', name: 'Cultural & Arts', icon: 'music', enabled: true },
        { id: 'community', name: 'Community Service', icon: 'hands-helping', enabled: true },
        { id: 'leadership', name: 'Leadership & Awards', icon: 'star', enabled: true },
        { id: 'competitions', name: 'Competitions', icon: 'medal', enabled: true },
        { id: 'publications', name: 'Publications', icon: 'book-open', enabled: true }
      ],
      default_achievements: achievementsTabConfig.default_achievements ? JSON.parse(achievementsTabConfig.default_achievements) : [
        {
          id: 1,
          title: 'Best College Award 2024',
          category: 'leadership',
          description: 'Recognized as the best college in the region for academic excellence and student development.',
          content: 'AAASC College received the prestigious "Best College Award 2024" from the State Education Department for outstanding performance in academics, infrastructure, and student development. This recognition highlights our commitment to providing quality education and fostering a supportive learning environment.',
          images: ['/achievements/award1.jpg', '/achievements/award2.jpg'],
          date: '2024-03-15',
          organization: 'State Education Department',
          level: 'State',
          featured: true,
          order: 1,
          published: true
        },
        {
          id: 2,
          title: 'National Science Olympiad Winners',
          category: 'competitions',
          description: 'Our students secured first place in the National Science Olympiad 2024.',
          content: 'A team of five students from AAASC College won the National Science Olympiad 2024, competing against 200+ colleges nationwide. The team demonstrated exceptional knowledge in physics, chemistry, and biology, showcasing the quality of our science education.',
          images: ['/achievements/olympiad1.jpg', '/achievements/olympiad2.jpg'],
          date: '2024-02-20',
          organization: 'National Science Foundation',
          level: 'National',
          featured: true,
          order: 2,
          published: true
        }
      ],
      settings: {
        show_categories: achievementsTabConfig.show_categories !== 'false',
        show_filters: achievementsTabConfig.show_filters !== 'false',
        show_search: achievementsTabConfig.show_search !== 'false',
        items_per_page: parseInt(achievementsTabConfig.items_per_page) || 12,
        show_date: achievementsTabConfig.show_date !== 'false',
        show_organization: achievementsTabConfig.show_organization !== 'false',
        show_level: achievementsTabConfig.show_level !== 'false',
        show_featured_badge: achievementsTabConfig.show_featured_badge !== 'false',
        date_format: achievementsTabConfig.date_format || 'MMMM DD, YYYY',
        enable_featured_section: achievementsTabConfig.enable_featured_section !== 'false',
        featured_section_title: achievementsTabConfig.featured_section_title || 'Featured Achievements',
        featured_section_description: achievementsTabConfig.featured_section_description || 'Highlighting our most significant accomplishments and recognitions.'
      }
    });
  });
});

// Update achievements tab configuration
router.put('/', [
  body('data').isObject().withMessage('Achievements tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store achievements tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `achievements_tab_${key}`;
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
                message: 'Some achievements tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Achievements tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update achievements tab configuration' });
  }
});

module.exports = router;
