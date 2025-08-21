const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get contact tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "contact_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch contact tab configuration' });
    }

    // Convert rows to object format
    const contactTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('contact_tab_', '');
      contactTabConfig[key] = row.value;
    });

    // Return structured contact tab configuration
    res.json({
      title: contactTabConfig.title || 'Contact Management',
      description: contactTabConfig.description || 'Manage your website contact information',
      contact_form: {
        enabled: contactTabConfig.contact_form_enabled !== 'false',
        fields: contactTabConfig.contact_form_fields ? JSON.parse(contactTabConfig.contact_form_fields) : [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true }
        ],
        submit_button_text: contactTabConfig.contact_form_submit_text || 'Send Message',
        success_message: contactTabConfig.contact_form_success_msg || 'Thank you! Your message has been sent successfully.',
        error_message: contactTabConfig.contact_form_error_msg || 'Sorry, there was an error sending your message. Please try again.'
      },
      contact_info: {
        address: contactTabConfig.address || '123 College Street, City, State',
        phone: contactTabConfig.phone || '+1 234 567 8900',
        email: contactTabConfig.email || 'info@aaasc.edu',
        website: contactTabConfig.website || 'https://aaasc.edu',
        hours: contactTabConfig.hours || 'Monday - Friday: 9:00 AM - 5:00 PM'
      },
      social_media: {
        facebook: contactTabConfig.facebook || '',
        twitter: contactTabConfig.twitter || '',
        instagram: contactTabConfig.instagram || '',
        linkedin: contactTabConfig.linkedin || '',
        youtube: contactTabConfig.youtube || ''
      },
      map: {
        enabled: contactTabConfig.map_enabled !== 'false',
        latitude: parseFloat(contactTabConfig.map_latitude) || 0,
        longitude: parseFloat(contactTabConfig.map_longitude) || 0,
        zoom: parseInt(contactTabConfig.map_zoom) || 15,
        api_key: contactTabConfig.map_api_key || ''
      }
    });
  });
});

// Update contact tab configuration
router.put('/', [
  body('data').isObject().withMessage('Contact tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store contact tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `contact_tab_${key}`;
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
                message: 'Some contact tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Contact tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update contact tab configuration' });
  }
});

module.exports = router;
