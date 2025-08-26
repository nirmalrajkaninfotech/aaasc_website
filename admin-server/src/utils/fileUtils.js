import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function readJsonFile(filename) {
  const filePath = path.join(dataDir, `${filename}.json`);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // Return empty object if file doesn't exist
    }
    console.error('Error reading file:', error);
    throw error;
  }
}

export function writeJsonFile(filename, data) {
  const filePath = path.join(dataDir, `${filename}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}

// Site-specific utilities
export function readSiteData() {
  return readJsonFile('site') || {};
}

export function writeSiteData(data) {
  writeJsonFile('site', data);
}

// Carousel utilities
export function readCarouselItems() {
  const siteData = readSiteData();
  return siteData.carousel?.items || [];
}

export function writeCarouselItems(items) {
  const siteData = readSiteData();
  if (!siteData.carousel) {
    siteData.carousel = { title: 'Main Carousel', subtitle: '', items: [] };
  }
  siteData.carousel.items = items;
  writeSiteData(siteData);
}

// Generic CRUD operations
export class JsonCrud {
  constructor(filename) {
    this.filename = filename;
  }

  getAll() {
    const data = readJsonFile(this.filename);
    return Array.isArray(data) ? data : [];
  }

  getById(id) {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  create(item) {
    const items = this.getAll();
    const newItem = { ...item, id: item.id || Date.now().toString() };
    items.push(newItem);
    writeJsonFile(this.filename, items);
    return newItem;
  }

  update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    writeJsonFile(this.filename, items);
    return updatedItem;
  }

  delete(id) {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) return false;
    
    writeJsonFile(this.filename, filteredItems);
    return true;
  }
}
