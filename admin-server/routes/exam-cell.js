const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get exam cell information
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "exam_cell_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch exam cell information' });
    }

    // Convert rows to object format
    const examCellInfo = {};
    rows.forEach(row => {
      const key = row.key.replace('exam_cell_', '');
      examCellInfo[key] = row.value;
    });

    // Return structured exam cell information
    res.json({
      title: examCellInfo.title || 'Examination Cell',
      description: examCellInfo.description || 'Managing all examination-related activities and processes',
      contact: {
        head: examCellInfo.head || 'Dr. Exam Coordinator',
        email: examCellInfo.email || 'examcell@aaasc.edu',
        phone: examCellInfo.phone || '+91 98765 43210',
        office: examCellInfo.office || 'Main Building, Room 101',
        hours: examCellInfo.hours || 'Monday - Friday: 9:00 AM - 5:00 PM'
      },
      functions: examCellInfo.functions ? JSON.parse(examCellInfo.functions) : [
        'Examination Schedule Management',
        'Question Paper Preparation',
        'Answer Sheet Evaluation',
        'Result Processing',
        'Grade Calculation',
        'Certificate Issuance',
        'Academic Record Maintenance'
      ],
      exam_types: examCellInfo.exam_types ? JSON.parse(examCellInfo.exam_types) : [
        { id: 'internal', name: 'Internal Assessment', frequency: 'Monthly', weightage: '30%' },
        { id: 'mid-semester', name: 'Mid-Semester Exam', frequency: 'Per Semester', weightage: '20%' },
        { id: 'end-semester', name: 'End-Semester Exam', frequency: 'Per Semester', weightage: '50%' },
        { id: 'practical', name: 'Practical Examination', frequency: 'Per Semester', weightage: 'Varies' }
      ],
      policies: examCellInfo.policies ? JSON.parse(examCellInfo.policies) : [
        'Students must carry valid ID cards during exams',
        'No electronic devices allowed in examination halls',
        'Attendance is mandatory for all examinations',
        'Results will be declared within 15 days of exam completion'
      ],
      announcements: examCellInfo.announcements ? JSON.parse(examCellInfo.announcements) : [
        {
          id: 1,
          title: 'End-Semester Examination Schedule',
          content: 'The end-semester examinations for all departments will commence from December 1, 2024.',
          date: '2024-11-15',
          important: true
        },
        {
          id: 2,
          title: 'Internal Assessment Guidelines',
          content: 'Updated guidelines for internal assessment evaluation have been published.',
          date: '2024-11-10',
          important: false
        }
      ]
    });
  });
});

// Update exam cell information
router.put('/', [
  body('data').isObject().withMessage('Exam cell data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store exam cell data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `exam_cell_${key}`;
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
                message: 'Some exam cell information failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Exam cell information updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update exam cell information' });
  }
});

module.exports = router;
