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

export class FileStorage {
  constructor(filename) {
    this.filePath = path.join(dataDir, `${filename}.json`);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      this.writeData([]);
    }
  }

  readData() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read data');
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to write data');
    }
  }

  // CRUD Operations
  getAll() {
    return this.readData();
  }

  getById(id) {
    const items = this.readData();
    return items.find(item => item.id === id);
  }

  create(item) {
    const items = this.readData();
    const newItem = { ...item, id: Date.now().toString() };
    items.push(newItem);
    this.writeData(items);
    return newItem;
  }

  update(id, updates) {
    const items = this.readData();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    this.writeData(items);
    return updatedItem;
  }

  delete(id) {
    const items = this.readData();
    const filteredItems = items.filter(item => item.id !== id);
    if (filteredItems.length === items.length) return false;
    
    this.writeData(filteredItems);
    return true;
  }
}
