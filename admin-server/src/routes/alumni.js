import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const ALUMNI_FILE = 'alumni';

// GET /api/alumni - Get all alumni (with optional filters)
router.get('/', 
  asyncHandler(async (req, res) => {
    const { batch, department, search } = req.query;
    let alumni = readJsonFile(ALUMNI_FILE) || [];

    // Apply filters if provided
    if (batch) {
      alumni = alumni.filter(alumnus => alumnus.batch === batch);
    }
    
    if (department) {
      alumni = alumni.filter(alumnus => alumnus.department === department);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      alumni = alumni.filter(alumnus => 
        alumnus.name.toLowerCase().includes(searchTerm) ||
        (alumnus.email && alumnus.email.toLowerCase().includes(searchTerm)) ||
        (alumnus.currentPosition && alumnus.currentPosition.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by batch (newest first) by default
    alumni.sort((a, b) => b.batch - a.batch);
    
    res.json(alumni);
  })
);

// GET /api/alumni/:id - Get single alumnus by ID
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const alumni = readJsonFile(ALUMNI_FILE) || [];
    const alumnus = alumni.find(a => a.id === id);
    
    if (!alumnus) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }
    
    res.json(alumnus);
  })
);

// POST /api/alumni - Add new alumnus (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      batch,
      department,
      currentPosition,
      company,
      achievements,
      socialLinks
    } = req.body;

    if (!name || !batch || !department) {
      return res.status(400).json({ error: 'Name, batch, and department are required' });
    }

    const alumni = readJsonFile(ALUMNI_FILE) || [];
    
    const newAlumnus = {
      id: Date.now().toString(),
      name,
      email: email || '',
      phone: phone || '',
      batch,
      department,
      currentPosition: currentPosition || '',
      company: company || '',
      achievements: achievements || [],
      socialLinks: socialLinks || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    alumni.push(newAlumnus);
    writeJsonFile(ALUMNI_FILE, alumni);

    res.status(201).json(newAlumnus);
  })
);

// PUT /api/alumni/:id - Update alumnus (protected)
router.put('/:id', 
  authenticate,
  authorize(['admin', 'editor']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const alumni = readJsonFile(ALUMNI_FILE) || [];
    const index = alumni.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    // Preserve created date and update timestamp
    const updatedAlumnus = {
      ...alumni[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    alumni[index] = updatedAlumnus;
    writeJsonFile(ALUMNI_FILE, alumni);

    res.json(updatedAlumnus);
  })
);

// DELETE /api/alumni/:id - Delete alumnus (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const alumni = readJsonFile(ALUMNI_FILE) || [];
    const filteredAlumni = alumni.filter(a => a.id !== id);
    
    if (filteredAlumni.length === alumni.length) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    writeJsonFile(ALUMNI_FILE, filteredAlumni);
    
    res.json({ success: true, message: 'Alumnus deleted successfully' });
  })
);

// GET /api/alumni/batches - Get list of all batches
router.get('/batches', 
  asyncHandler(async (req, res) => {
    const alumni = readJsonFile(ALUMNI_FILE) || [];
    const batches = [...new Set(alumni.map(a => a.batch))].sort((a, b) => b - a);
    res.json(batches);
  })
);

// GET /api/alumni/departments - Get list of all departments
router.get('/departments', 
  asyncHandler(async (req, res) => {
    const alumni = readJsonFile(ALUMNI_FILE) || [];
    const departments = [...new Set(alumni.map(a => a.department))].sort();
    res.json(departments);
  })
);

export default router;
