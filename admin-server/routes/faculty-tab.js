const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

const router = express.Router();

// Get faculty tab configuration
router.get('/', (req, res) => {
  db.all('SELECT * FROM site_settings WHERE key LIKE "faculty_tab_%"', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch faculty tab configuration' });
    }

    // Convert rows to object format
    const facultyTabConfig = {};
    rows.forEach(row => {
      const key = row.key.replace('faculty_tab_', '');
      facultyTabConfig[key] = row.value;
    });

    // Return structured faculty tab configuration
    res.json({
      title: facultyTabConfig.title || 'Faculty Management',
      description: facultyTabConfig.description || 'Manage your college faculty members and staff',
      departments: facultyTabConfig.departments ? JSON.parse(facultyTabConfig.departments) : [
        { id: 'computer-science', name: 'Computer Science', code: 'CS', enabled: true },
        { id: 'mathematics', name: 'Mathematics', code: 'MATH', enabled: true },
        { id: 'physics', name: 'Physics', code: 'PHY', enabled: true },
        { id: 'chemistry', name: 'Chemistry', code: 'CHEM', enabled: true },
        { id: 'english', name: 'English', code: 'ENG', enabled: true },
        { id: 'tamil', name: 'Tamil', code: 'TAM', enabled: true },
        { id: 'commerce', name: 'Commerce', code: 'COM', enabled: true },
        { id: 'management', name: 'Management', code: 'MGT', enabled: true }
      ],
      designations: facultyTabConfig.designations ? JSON.parse(facultyTabConfig.designations) : [
        { id: 'professor', name: 'Professor', level: 1, enabled: true },
        { id: 'associate-professor', name: 'Associate Professor', level: 2, enabled: true },
        { id: 'assistant-professor', name: 'Assistant Professor', level: 3, enabled: true },
        { id: 'lecturer', name: 'Lecturer', level: 4, enabled: true },
        { id: 'guest-faculty', name: 'Guest Faculty', level: 5, enabled: true },
        { id: 'visiting-professor', name: 'Visiting Professor', level: 1, enabled: true }
      ],
      default_faculty: facultyTabConfig.default_faculty ? JSON.parse(facultyTabConfig.default_faculty) : [
        {
          id: 1,
          slug: 'dr-john-doe',
          title: 'Dr. John Doe',
          subtitle: 'Head of Computer Science Department',
          designation: 'associate-professor',
          department: 'computer-science',
          email: 'john.doe@aaasc.edu',
          phone: '+91 98765 43210',
          content: 'Dr. John Doe is an experienced computer science educator with over 15 years of teaching experience. He specializes in algorithms, data structures, and software engineering. Dr. Doe has published numerous research papers and has guided many successful student projects.',
          image: '/faculty/john-doe.jpg',
          images: ['/faculty/john-doe1.jpg', '/faculty/john-doe2.jpg'],
          qualifications: ['Ph.D. in Computer Science', 'M.Tech in Software Engineering', 'B.Tech in Computer Science'],
          research_areas: ['Algorithms', 'Data Structures', 'Software Engineering', 'Machine Learning'],
          publications: ['15+ Research Papers', '3 Books', '10+ Conference Presentations'],
          experience: '15+ years',
          order: 1,
          published: true
        },
        {
          id: 2,
          slug: 'prof-jane-smith',
          title: 'Prof. Jane Smith',
          subtitle: 'Senior Mathematics Professor',
          designation: 'professor',
          department: 'mathematics',
          email: 'jane.smith@aaasc.edu',
          phone: '+91 98765 43211',
          content: 'Prof. Jane Smith is a distinguished mathematics professor with expertise in advanced calculus, linear algebra, and mathematical modeling. She has received several awards for her contributions to mathematics education and has mentored countless students.',
          image: '/faculty/jane-smith.jpg',
          images: ['/faculty/jane-smith1.jpg', '/faculty/jane-smith2.jpg'],
          qualifications: ['Ph.D. in Mathematics', 'M.Sc in Applied Mathematics', 'B.Sc in Mathematics'],
          research_areas: ['Advanced Calculus', 'Linear Algebra', 'Mathematical Modeling', 'Number Theory'],
          publications: ['25+ Research Papers', '5 Books', '20+ Conference Presentations'],
          experience: '20+ years',
          order: 2,
          published: true
        }
      ],
      settings: {
        show_departments: facultyTabConfig.show_departments !== 'false',
        show_designations: facultyTabConfig.show_designations !== 'false',
        show_filters: facultyTabConfig.show_filters !== 'false',
        show_search: facultyTabConfig.show_search !== 'false',
        items_per_page: parseInt(facultyTabConfig.items_per_page) || 12,
        show_qualifications: facultyTabConfig.show_qualifications !== 'false',
        show_research_areas: facultyTabConfig.show_research_areas !== 'false',
        show_publications: facultyTabConfig.show_publications !== 'false',
        show_experience: facultyTabConfig.show_experience !== 'false',
        show_contact_info: facultyTabConfig.show_contact_info !== 'false',
        enable_department_pages: facultyTabConfig.enable_department_pages !== 'false',
        show_faculty_count: facultyTabConfig.show_faculty_count !== 'false',
        enable_faculty_profiles: facultyTabConfig.enable_faculty_profiles !== 'false'
      }
    });
  });
});

// Update faculty tab configuration
router.put('/', [
  body('data').isObject().withMessage('Faculty tab data is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;

    // Store faculty tab data in site settings
    const updates = Object.entries(data);
    let completed = 0;
    let updateErrors = [];

    updates.forEach(([key, value]) => {
      const settingKey = `faculty_tab_${key}`;
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
                message: 'Some faculty tab configuration failed to update',
                errors: updateErrors
              });
            }
            
            res.json({ 
              message: 'Faculty tab configuration updated successfully',
              updatedCount: updates.length
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update faculty tab configuration' });
  }
});

module.exports = router;
