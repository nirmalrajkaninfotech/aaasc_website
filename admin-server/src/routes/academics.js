import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';

const router = express.Router();
const DATA_FILE = 'academics';

// GET /api/academics - Get all academic programs
router.get('/', (req, res) => {
  try {
    const data = readJsonFile(DATA_FILE);
    if (!data) {
      // Return default data if file doesn't exist
      const defaultData = {
        title: 'Academic Programs',
        subtitle: 'Explore our diverse range of academic programs',
        programs: [],
        additionalInfo: ''
      };
      writeJsonFile(DATA_FILE, defaultData);
      return res.json(defaultData);
    }
    res.json(data);
  } catch (error) {
    console.error('Error reading academics data:', error);
    res.status(500).json({ error: 'Failed to fetch academic programs' });
  }
});

// POST /api/academics - Create or update academic programs
router.post('/', (req, res) => {
  try {
    const { title, subtitle, programs, additionalInfo } = req.body;
    
    if (!title || !Array.isArray(programs)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const data = {
      title,
      subtitle: subtitle || '',
      programs: programs.map(program => ({
        id: program.id || Date.now().toString(),
        name: program.name || '',
        description: program.description || '',
        duration: program.duration || '',
        degree: program.degree || '',
        requirements: program.requirements || [],
        curriculum: program.curriculum || []
      })),
      additionalInfo: additionalInfo || ''
    };

    writeJsonFile(DATA_FILE, data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving academics data:', error);
    res.status(500).json({ error: 'Failed to save academic programs' });
  }
});

// GET /api/academics/public - Get public academic programs
router.get('/public', (req, res) => {
  try {
    const data = readJsonFile(DATA_FILE);
    if (!data) {
      return res.json({
        title: 'Academic Programs',
        subtitle: 'Explore our diverse range of academic programs',
        programs: [],
        additionalInfo: ''
      });
    }
    
    // Return only public data (exclude any sensitive information)
    const publicData = {
      title: data.title,
      subtitle: data.subtitle,
      programs: data.programs.map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        duration: program.duration,
        degree: program.degree
      })),
      additionalInfo: data.additionalInfo
    };
    
    res.json(publicData);
  } catch (error) {
    console.error('Error fetching public academics data:', error);
    res.status(500).json({ error: 'Failed to fetch academic programs' });
  }
});

export default router;
