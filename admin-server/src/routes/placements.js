// routes/placements.js

import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const PLACEMENTS_FILE = 'placements';
const PLACEMENT_APPLICATIONS_FILE = 'placement-applications';

// Utility: Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// GET /api/placements - Get all placement opportunities with filters
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, company, type } = req.query;
    let placements = readJsonFile(PLACEMENTS_FILE) || [];

    // Filter logic
    if (status) {
      placements = placements.filter((p) => p.status === status);
    }

    if (company) {
      placements = placements.filter((p) =>
        p.companyName?.toLowerCase().includes(company.toLowerCase())
      );
    }

    if (type) {
      placements = placements.filter((p) => p.type === type);
    }

    // Sort by posted date: newest first
    placements.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    res.json(placements);
  })
);

// GET /api/placements/:id - Get single placement by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const placement = placements.find((p) => p.id === id);

    if (!placement) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    res.json(placement);
  })
);

// POST /api/placements - Add new placement (admin/placement only)
router.post(
  '/',
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
      contactPhone,
    } = req.body;

    if (!companyName || !position || !description || !applicationDeadline) {
      return res.status(400).json({
        error:
          'Company name, position, description, and application deadline are required',
      });
    }

    const placements = readJsonFile(PLACEMENTS_FILE) || [];

    const newPlacement = {
      id: generateId(),
      companyName,
      position,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      location: location || 'Not specified',
      type: type || 'Full-time',
      salary: salary || 'Negotiable',
      applicationDeadline,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      status: 'open',
      postedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    placements.push(newPlacement);
    writeJsonFile(PLACEMENTS_FILE, placements);

    res.status(201).json(newPlacement);
  })
);

// PUT /api/placements/:id - Update placement (admin/placement only)
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'placement']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const index = placements.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    const updatedPlacement = {
      ...placements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    placements[index] = updatedPlacement;
    writeJsonFile(PLACEMENTS_FILE, placements);

    res.json(updatedPlacement);
  })
);

// DELETE /api/placements/:id - Delete placement (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const initialLength = placements.length;

    const filteredPlacements = placements.filter((p) => p.id !== id);

    if (filteredPlacements.length === initialLength) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    // Remove related applications
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const filteredApplications = applications.filter((app) => app.placementId !== id);

    writeJsonFile(PLACEMENTS_FILE, filteredPlacements);
    writeJsonFile(PLACEMENT_APPLICATIONS_FILE, filteredApplications); // Save even if unchanged

    res.json({ success: true, message: 'Placement deleted successfully' });
  })
);

// GET /api/placements/:id/applications - Get all applications for a placement
router.get(
  '/:id/applications',
  authenticate,
  authorize(['admin', 'placement']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const placementApplications = applications.filter((app) => app.placementId === id);

    res.json(placementApplications);
  })
);

// POST /api/placements/:id/apply - Apply to a placement
router.post(
  '/:id/apply',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      studentName,
      studentEmail,
      studentPhone,
      studentId,
      department,
      resumeUrl,
      coverLetter,
    } = req.body;

    // Validation
    if (!studentName || !studentEmail || !studentId || !resumeUrl) {
      return res.status(400).json({
        error: 'Student name, email, ID, and resume URL are required',
      });
    }

    // Check if placement exists
    const placements = readJsonFile(PLACEMENTS_FILE) || [];
    const placement = placements.find((p) => p.id === id);

    if (!placement) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    if (placement.status !== 'open') {
      return res.status(400).json({ error: 'This placement is not accepting applications' });
    }

    // Prevent duplicate applications
    const applications = readJsonFile(PLACEMENT_APPLICATIONS_FILE) || [];
    const alreadyApplied = applications.some(
      (app) => app.placementId === id && app.studentEmail === studentEmail
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied to this placement' });
    }

    const newApplication = {
      id: generateId(),
      placementId: id,
      studentName,
      studentEmail,
      studentPhone: studentPhone || null,
      studentId,
      department: department || 'Not specified',
      resumeUrl,
      coverLetter: coverLetter || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    applications.push(newApplication);
    writeJsonFile(PLACEMENT_APPLICATIONS_FILE, applications);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application: newApplication,
    });
  })
);

export default router;