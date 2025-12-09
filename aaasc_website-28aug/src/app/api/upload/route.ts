import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return handleOptionsRequest(origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response = NextResponse.json({ error: 'No file provided' }, { status: 400 });
      return addCorsHeaders(response, origin);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      const response = NextResponse.json({ error: 'File must be an image' }, { status: 400 });
      return addCorsHeaders(response, origin);
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const response = NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      return addCorsHeaders(response, origin);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${filename}`;
    const response = NextResponse.json({ url }, { status: 200 });
    return addCorsHeaders(response, origin);

  } catch (error) {
    console.error('Upload error:', error);
    const response = NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}