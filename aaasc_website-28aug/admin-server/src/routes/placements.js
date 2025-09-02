// routes/placements.js

import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const placementsPath = path.join(process.cwd(), 'data', 'placements.json');

// Utility: Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Read placements data
function readPlacements() {
  try {
    const data = fs.readFileSync(placementsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        title: 'Student Placements',
        subtitle: 'Our graduates excel in top companies worldwide.',
        items: []
      };
    }
    console.error('Error reading placements file:', error);
    throw error;
  }
}

// Write placements data
function writePlacements(placements) {
  try {
    fs.writeFileSync(placementsPath, JSON.stringify(placements, null, 2));
  } catch (error) {
    console.error('Error writing placements file:', error);
    throw error;
  }
}

// GET /api/placements - Get all placement opportunities
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, company, type } = req.query;
    const placements = readPlacements();
    
    // If filtering is needed, apply it to items
    let filteredItems = placements.items;

    if (status) {
      filteredItems = filteredItems.filter((p) => p.status === status);
    }

    if (company) {
      filteredItems = filteredItems.filter((p) =>
        p.companyName?.toLowerCase().includes(company.toLowerCase())
      );
    }

    if (type) {
      filteredItems = filteredItems.filter((p) => p.type === type);
    }

    // Sort by posted date: newest first
    filteredItems.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

    res.json({
      ...placements,
      items: filteredItems
    });
  })
);

// GET /api/placements/:id - Get single placement by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const placements = readPlacements();
    const placement = placements.items.find((p) => p.id === id);

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

    const placements = readPlacements();

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

    placements.items.push(newPlacement);
    writePlacements(placements);

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

    const placements = readPlacements();
    const index = placements.items.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    const updatedPlacement = {
      ...placements.items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    placements.items[index] = updatedPlacement;
    writePlacements(placements);

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
    const placements = readPlacements();
    const initialLength = placements.items.length;

    const filteredItems = placements.items.filter((p) => p.id !== id);

    if (filteredItems.length === initialLength) {
      return res.status(404).json({ error: 'Placement opportunity not found' });
    }

    placements.items = filteredItems;
    writePlacements(placements);

    res.json({ success: true, message: 'Placement deleted successfully' });
  })
);

export default router;