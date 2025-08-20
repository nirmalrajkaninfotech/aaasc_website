import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Collage } from '@/types';

const collagesPath = path.join(process.cwd(), 'data', 'collages.json');

function readCollages(): Collage[] {
  try {
    const data = fs.readFileSync(collagesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeCollages(collages: Collage[]): void {
  fs.writeFileSync(collagesPath, JSON.stringify(collages, null, 2));
}

export async function GET() {
  try {
    const collages = readCollages();
    return NextResponse.json(collages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read collages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, featured, tags, date, images } = body;

    if (!title || !category || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Title, category, and images are required' }, { status: 400 });
    }

    const collages = readCollages();
    const newId = collages.length > 0 ? Math.max(...collages.map(c => c.id)) + 1 : 1;
    
    const newCollage: Collage = {
      id: newId,
      title,
      description: description || '',
      category,
      date: date || new Date().toISOString().split('T')[0],
      featured: Boolean(featured),
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : []
    };

    collages.push(newCollage);
    writeCollages(collages);

    return NextResponse.json(newCollage, { status: 201 });
  } catch (error) {
    console.error('Error creating collage:', error);
    return NextResponse.json({ error: 'Failed to create collage' }, { status: 500 });
  }
}