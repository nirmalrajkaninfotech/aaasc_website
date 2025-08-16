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
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const collages = readCollages();
    const newId = Math.max(...collages.map(c => c.id), 0) + 1;
    
    const newCollage: Collage = {
      id: newId,
      title,
      description: description || '',
      category,
      date: date || new Date().toISOString().split('T')[0],
      featured: featured || false,
      tags: tags || [],
      images
    };

    collages.push(newCollage);
    writeCollages(collages);

    return NextResponse.json(newCollage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create collage' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, category, featured, tags, images } = body;

    if (!id || !title || !category || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const collages = readCollages();
    const index = collages.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    collages[index] = { 
      ...collages[index],
      title, 
      description: description || '',
      category,
      featured: featured || false,
      tags: tags || [],
      images 
    };
    writeCollages(collages);

    return NextResponse.json(collages[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update collage' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const collages = readCollages();
    const filteredCollages = collages.filter(c => c.id !== id);

    if (filteredCollages.length === collages.length) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    writeCollages(filteredCollages);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete collage' }, { status: 500 });
  }
}