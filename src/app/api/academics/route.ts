import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AcademicSection } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data/academics.json');

// Helper function to read data from file
const readData = (): AcademicSection | null => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return null;
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading academics data:', error);
    return null;
  }
};

// Helper function to write data to file
const writeData = (data: AcademicSection) => {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing academics data:', error);
    return false;
  }
};

export async function GET() {
  try {
    const data = readData();
    if (!data) {
      // Return default data if file doesn't exist
      const defaultData: AcademicSection = {
        title: 'Academic Programs',
        subtitle: 'Explore our diverse range of academic programs',
        programs: [],
        additionalInfo: ''
      };
      writeData(defaultData);
      return NextResponse.json(defaultData);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching academics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: AcademicSection = await request.json();
    const success = writeData(data);
    
    if (!success) {
      throw new Error('Failed to save data');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving academics data:', error);
    return NextResponse.json(
      { error: 'Failed to save academics data' },
      { status: 500 }
    );
  }
}
