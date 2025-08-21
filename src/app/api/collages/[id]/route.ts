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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collages = readCollages();
    const collage = collages.find(c => c.id === parseInt(id));
    
    if (!collage) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }
    
    return NextResponse.json(collage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collage' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, category, featured, tags, images } = body;
    const idNum = parseInt(id);

    if (!title || !category || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const collages = readCollages();
    const index = collages.findIndex(c => c.id === idNum);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const collages = readCollages();
    const filteredCollages = collages.filter(c => c.id !== idNum);

    if (filteredCollages.length === collages.length) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    writeCollages(filteredCollages);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete collage' }, { status: 500 });
  }
}
