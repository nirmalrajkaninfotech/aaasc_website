import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { corsHeaders } from '@/lib/cors';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'iqac.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const iqacData = JSON.parse(data);
    
    return NextResponse.json(iqacData, { headers: corsHeaders });
  } catch (error) {
    console.error('Error reading IQAC data:', error);
    return NextResponse.json(
      { error: 'Failed to load IQAC data' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'iqac.json');
    
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    
    return NextResponse.json(
      { success: true, message: 'IQAC data updated successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating IQAC data:', error);
    return NextResponse.json(
      { error: 'Failed to update IQAC data' },
      { status: 500, headers: corsHeaders }
    );
  }
}