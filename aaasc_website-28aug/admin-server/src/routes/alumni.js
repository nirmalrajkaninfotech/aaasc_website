import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const alumniPath = path.join(process.cwd(), 'data', 'alumni.json');

// Utility: Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Read alumni data
function readAlumni() {
  try {
    const data = fs.readFileSync(alumniPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        title: 'Alumni Association',
        content: 'Welcome to the Alumni Association. Stay connected with your alma mater!',
        image: '',
        members: []
      };
    }
    console.error('Error reading alumni file:', error);
    throw error;
  }
}

// Write alumni data
function writeAlumni(alumni) {
  try {
    fs.writeFileSync(alumniPath, JSON.stringify(alumni, null, 2));
  } catch (error) {
    console.error('Error writing alumni file:', error);
    throw error;
  }
}

// GET /api/alumni - Get all alumni (with optional filters)
router.get('/', 
  asyncHandler(async (req, res) => {
    const { batch, department, search } = req.query;
    const alumni = readAlumni();
    
    // If filtering is needed, apply it to members
    let filteredMembers = alumni.members;

    if (batch) {
      filteredMembers = filteredMembers.filter(alumnus => alumnus.batch === batch);
    }
    
    if (department) {
      filteredMembers = filteredMembers.filter(alumnus => alumnus.department === department);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredMembers = filteredMembers.filter(alumnus => 
        alumnus.name.toLowerCase().includes(searchTerm) ||
        (alumnus.email && alumnus.email.toLowerCase().includes(searchTerm)) ||
        (alumnus.currentPosition && alumnus.currentPosition.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by batch (newest first) by default
    filteredMembers.sort((a, b) => b.batch - a.batch);
    
    res.json({
      ...alumni,
      members: filteredMembers
    });
  })
);

// GET /api/alumni/:id - Get single alumnus by ID
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const alumni = readAlumni();
    const alumnus = alumni.members.find(a => a.id === id);
    
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

    const alumni = readAlumni();
    
    const newAlumnus = {
      id: generateId(),
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

    alumni.members.push(newAlumnus);
    writeAlumni(alumni);

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
    
    const alumni = readAlumni();
    const index = alumni.members.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    // Preserve created date and update timestamp
    const updatedAlumnus = {
      ...alumni.members[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    alumni.members[index] = updatedAlumnus;
    writeAlumni(alumni);

    res.json(updatedAlumnus);
  })
);

// DELETE /api/alumni/:id - Delete alumnus (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const alumni = readAlumni();
    const initialLength = alumni.members.length;
    
    const filteredMembers = alumni.members.filter(a => a.id !== id);
    
    if (filteredMembers.length === initialLength) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }

    alumni.members = filteredMembers;
    writeAlumni(alumni);
    
    res.json({ success: true, message: 'Alumnus deleted successfully' });
  })
);

// GET /api/alumni/batches - Get list of all batches
router.get('/batches', 
  asyncHandler(async (req, res) => {
    const alumni = readAlumni();
    const batches = [...new Set(alumni.members.map(a => a.batch))].sort((a, b) => b - a);
    res.json(batches);
  })
);

// GET /api/alumni/departments - Get list of all departments
router.get('/departments', 
  asyncHandler(async (req, res) => {
    const alumni = readAlumni();
    const departments = [...new Set(alumni.members.map(a => a.department))].sort();
    res.json(departments);
  })
);

export default router;
