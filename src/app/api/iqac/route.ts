import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'iqac.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const iqacData = JSON.parse(data);
    
    return NextResponse.json(iqacData);
  } catch (error) {
    console.error('Error reading IQAC data:', error);
    return NextResponse.json({ error: 'Failed to load IQAC data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'iqac.json');
    
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    
    return NextResponse.json({ success: true, message: 'IQAC data updated successfully' });
  } catch (error) {
    console.error('Error updating IQAC data:', error);
    return NextResponse.json({ error: 'Failed to update IQAC data' }, { status: 500 });
  }
}