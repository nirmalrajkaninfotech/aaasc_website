// routes/collages.js
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// File path
const collagesPath = path.join(process.cwd(), 'data', 'collages.json');

// Utility: Read collages
function readCollages() {
  try {
    const data = fs.readFileSync(collagesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading collages.json:', error);
    return [];
  }
}

// Utility: Write collages
function writeCollages(collages) {
  try {
    fs.writeFileSync(collagesPath, JSON.stringify(collages, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to collages.json:', error);
    throw error;
  }
}

// GET /api/collages - Get all collages
router.get('/', (req, res) => {
  try {
    const collages = readCollages();
    res.json(collages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read collages' });
  }
});

// POST /api/collages - Create a new collage
router.post('/', (req, res) => {
  try {
    const { title, description, category, featured, tags, date, images } = req.body;

    // Validation
    if (!title || !category || !images || !Array.isArray(images)) {
      return res.status(400).json({
        error: 'Title, category, and images (as array) are required',
      });
    }

    const collages = readCollages();
    const newId = collages.length > 0 ? Math.max(...collages.map(c => c.id)) + 1 : 1;

    const newCollage = {
      id: newId,
      title,
      description: description || '',
      category,
      date: date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
      featured: Boolean(featured),
      tags: Array.isArray(tags) ? tags : [],
      images: images // assume array of strings or image objects
    };

    collages.push(newCollage);
    writeCollages(collages);

    res.status(201).json(newCollage);
  } catch (error) {
    console.error('Error creating collage:', error);
    res.status(500).json({ error: 'Failed to create collage' });
  }
});

export default router;