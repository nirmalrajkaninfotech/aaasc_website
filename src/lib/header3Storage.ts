import { Header3Content } from '@/types/header3';
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'header3.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const getHeader3Content = (): Header3Content => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error reading header3 content:', error);
  }
  
  // Return default content if file doesn't exist or there's an error
  return {
    id: 'header3',
    title: 'Welcome to Our Website',
    subtitle: 'Your compelling subtitle goes here',
    imageUrl: '/images/header-banner.jpg',
    updatedAt: new Date().toISOString()
  };
};

export const saveHeader3Content = async (content: Header3Content): Promise<Header3Content> => {
  try {
    ensureDataDirectory();
    
    // Create the full content with updated timestamp
    const fullContent = {
      ...content,
      updatedAt: new Date().toISOString()
    };
    
    // Write to a temporary file first
    const tempFile = `${DATA_FILE_PATH}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(fullContent, null, 2), 'utf-8');
    
    // Rename the temporary file to the actual file (atomic operation)
    fs.renameSync(tempFile, DATA_FILE_PATH);
    
    return fullContent;
  } catch (error) {
    console.error('Error saving header3 content:', error);
    throw error;
  }
};
