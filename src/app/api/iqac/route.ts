import { NextResponse } from 'next/server';
import { readIQACData, writeIQACData } from '@/lib/data';

export async function GET() {
  try {
    const iqacData = readIQACData();
    return NextResponse.json(iqacData);
  } catch (error) {
    console.error('Error reading IQAC data:', error);
    return NextResponse.json({ error: 'Failed to load IQAC data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    writeIQACData(body);
    return NextResponse.json({ success: true, message: 'IQAC data updated successfully' });
  } catch (error) {
    console.error('Error updating IQAC data:', error);
    return NextResponse.json({ error: 'Failed to update IQAC data' }, { status: 500 });
  }
}