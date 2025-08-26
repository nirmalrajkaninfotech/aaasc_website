import express from 'express';
import { readCarouselItems, writeCarouselItems } from '../utils/fileUtils.js';

const router = express.Router();

// GET /api/carousel - Get all carousel items
router.get('/', (req, res) => {
  try {
    const items = readCarouselItems();
    res.json(items);
  } catch (error) {
    console.error('Error reading carousel items:', error);
    res.status(500).json({ error: 'Failed to read carousel items' });
  }
});

// POST /api/carousel - Create new carousel item
router.post('/', (req, res) => {
  try {
    const newItem = req.body;
    let items = readCarouselItems();
    
    // Generate ID if not provided
    if (!newItem.id) {
      newItem.id = Date.now().toString();
    }
    
    // Set order to be last if not provided
    if (newItem.order === undefined) {
      const maxOrder = items.length > 0 ? Math.max(...items.map(item => item.order || 0)) : 0;
      newItem.order = maxOrder + 1;
    }
    
    // Prevent duplicate IDs
    items = items.filter(item => item.id !== newItem.id);
    items.push(newItem);
    
    writeCarouselItems(items);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating carousel item:', error);
    res.status(500).json({ error: 'Failed to create carousel item' });
  }
});

// PUT /api/carousel/:id - Update carousel item
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = req.body;
    
    if (id !== updatedItem.id) {
      return res.status(400).json({ error: 'ID in path and body do not match' });
    }
    
    const items = readCarouselItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    items[index] = updatedItem;
    writeCarouselItems(items);
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating carousel item:', error);
    res.status(500).json({ error: 'Failed to update carousel item' });
  }
});

// DELETE /api/carousel/:id - Delete carousel item
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const items = readCarouselItems();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    writeCarouselItems(filteredItems);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    res.status(500).json({ error: 'Failed to delete carousel item' });
  }
});

export default router;
