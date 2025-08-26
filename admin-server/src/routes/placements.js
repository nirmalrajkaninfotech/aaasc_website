import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const PLACEMENTS_FILE = 'placements';
const PLACEMENT_APPLICATIONS_FILE = 'placement-applications';

// GET /api/placements - Get all placement opportunities
router.get('/', 
  asyncHandler(async (req, res) => {
    const { status, company, type } = req.query;
    let placements = readJsonFile(PLACEMENTS_FILE) || [];

    // Apply filters if provided
    if (status) {
      placements = placements.filter(p => p.status === status);
    }
    
    if (company) {
      placements = placements.filter(p => 
        p.companyName.toLowerCase().includes(company.toLowerCase())
      );
    }
    
    if (type) {
      placements = placements.filter(p => p.type === type);
    }

    // Sort by posted date (newest first) by default
    placements.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    
    res.json(placements);
  })
);

// GET /api/placements/:id - Get single placement by ID
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const placement = placements.find(p => p.id === id);
    
    if (!placement) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }
    
    res.json(placement);
  })
);

// POST /api/placements - Add new placement opportunity (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'placement']),
  asyncHandler(async (req, res) => {
    const {
      companyName,
      position,
      description,
      requirements,
      location,
      type,
      salary,
      applicationDeadline,
      contactEmail,
      contactPhone
    } = req.body;

    if (!companyName || !position || !description || !applicationDeadline) {
      return res.status(400).json({ 
        error: 'Company name, position, description, and deadline are required' 
      });
    }

    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    
    const newPlacement = {
      id: Date.now().toString(),
      companyName,
      position,
      description,
      requirements: requirements || [],
      location: location || 'Not specified',
      type: type || 'Full-time',
      salary: salary || 'Negotiable',
      applicationDeadline,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      status: 'open',
      postedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    placements.push(newPlacement);
    writeJsonFile(PLACEMENTS_FILE, placements);

    res.status(201).json(newPlacement);
  })
);

// PUT /api/placements/:id - Update placement (protected)
router.put('/:id', 
  authenticate,
  authorize(['admin', 'placement']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const index = placements.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    const updatedPlacement = {
      ...placements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    placements[index] = updatedPlacement;
    writeJsonFile(PLACEMENTS_FILE, placements);

    res.json(updatedPlacement);
  })
);

// DELETE /api/placements/:id - Delete placement (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const filteredPlacements = placements.filter(p => p.id !== id);
    
    if (filteredPlacements.length === placements.length) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    // Also delete related applications
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const filteredApplications = applications.filter(app => app.placementId !== id);
    if (filteredApplications.length !== applications.length) {
      writeJsonFile(PLACEMENT_APPLICATIONS_FILE, filteredApplications);
    }

    writeJsonFile(PLACEMENTS_FILE, filteredPlacements);
    
    res.json({ success: true, message: 'Placement opportunity deleted successfully' });
  })
);

// GET /api/placements/:id/applications - Get applications for a placement (protected)
router.get('/:id/applications', 
  authenticate,
  authorize(['admin', 'placement']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const placementApplications = applications.filter(app => app.placementId === id);
    
    res.json(placementApplications);
  })
);

// POST /api/placements/:id/apply - Apply for a placement
router.post('/:id/apply', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      studentName,
      studentEmail,
      studentPhone,
      studentId,
      department,
      resumeUrl,
      coverLetter
    } = req.body;

    if (!studentName || !studentEmail || !studentId || !resumeUrl) {
      return res.status(400).json({ 
        error: 'Name, email, student ID, and resume are required' 
      });
    }

    // Check if placement exists and is open
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const placement = placements.find(p => p.id === id);
    
    if (!placement) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }
    
    if (placement.status !== 'open') {
      return res.status(400).json({ error: 'This placement is no longer accepting applications' });
    }

    // Check if student has already applied
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const hasApplied = applications.some(
      app => app.placementId === id && app.studentEmail === studentEmail
    );
    
    if (hasApplied) {
      return res.status(400).json({ error: 'You have already applied for this position' });
    }

    const newApplication = {
      id: Date.now().toString(),
      placementId: id,
      studentName,
      studentEmail,
      studentPhone: studentPhone || '',
      studentId,
      department: department || '',
      resumeUrl,
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    applications.push(newApplication);
    writeJsonFile(PLACEMENT_APPLICATIONS_FILE, applications);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });
  })
);

export default router;
