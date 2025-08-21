const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Get all site settings
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings ORDER BY key', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch site settings' });
    }

    // Convert rows to object format
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  });
});

// Get specific site setting
router.get('/:key', (req, res) => {
  const { key } = req.params;

  db.get('SELECT * FROM site_settings WHERE key = ?', [key], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch site setting' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ key: row.key, value: row.value });
  });
});

// Update site setting
router.put('/:key', [
  body('value').notEmpty().withMessage('Value is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value } = req.body;

    db.run(
      'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update site setting' });
        }

        res.json({ 
          message: 'Site setting updated successfully',
          key,
          value
        });
      }
    );
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update multiple site settings at once
router.put('/', [
  body('settings').isObject().withMessage('Settings object is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    const updates = Object.entries(settings);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      db.run(
        'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
          if (err) {
            console.error(`Database error for ${key}:`, err);
            updateErrors.push({ key, error: 'Failed to update' });
          }
          
          completed++;
          
          if (completed === updates.length) {
            if (updateErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some settings failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'All site settings updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete site setting
router.delete('/:key', (req, res) => {
  const { key } = req.params;

  db.run('DELETE FROM site_settings WHERE key = ?', [key], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to delete site setting' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Site setting deleted successfully' });
  });
});

// Export site settings to JSON file
router.post('/export', async (req, res) => {
  try {
    db.all('SELECT * FROM site_settings ORDER BY key', async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch site settings' });
      }

      // Convert rows to object format
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });

      // Write to JSON file
      const dataPath = path.join(__dirname, '../../data/site.json');
      await fs.writeFile(dataPath, JSON.stringify(settings, null, 2));

      res.json({ 
        message: 'Site settings exported successfully',
        settings,
        exportedTo: dataPath
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export site settings' });
  }
});

// Import site settings from JSON file
router.post('/import', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }

    const updates = Object.entries(settings);
    let completed = 0;
    let importErrors = [];

    updates.forEach(([key, value]) => {
      db.run(
        'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
          if (err) {
            console.error(`Database error for ${key}:`, err);
            importErrors.push({ key, error: 'Failed to import' });
          }
          
          completed++;
          
          if (completed === updates.length) {
            if (importErrors.length > 0) {
              return res.status(500).json({ 
                message: 'Some settings failed to import',
                errors: importErrors
              });
            }
            
            res.json({ 
              message: 'Site settings imported successfully',
              importedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import site settings' });
  }
});

// Reset site settings to defaults
router.post('/reset', (req, res) => {
  const defaultSettings = [
    ['site_title', 'AAASC College'],
    ['logo', '/logo.png'],
    ['hero_title', 'Welcome to AAASC College'],
    ['hero_subtitle', 'Excellence in Education'],
    ['contact_address', '123 College Street, City, State'],
    ['contact_phone', '+1 234 567 8900'],
    ['contact_email', 'info@aaasc.edu'],
    ['footer_text', '© 2025 AAASC College. All rights reserved.']
  ];

  let completed = 0;
  let resetErrors = [];

  defaultSettings.forEach(([key, value]) => {
    db.run(
      'INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value],
      function(err) {
        if (err) {
          console.error(`Database error for ${key}:`, err);
          resetErrors.push({ key, error: 'Failed to reset' });
        }
        
        completed++;
        
        if (completed === defaultSettings.length) {
          if (resetErrors.length > 0) {
            return res.status(500).json({ 
              message: 'Some settings failed to reset',
              errors: resetErrors
            });
          }
          
          res.json({ 
            message: 'Site settings reset to defaults successfully',
            resetCount: defaultSettings.length
          });
        }
      }
    );
  });
});

module.exports = router;
