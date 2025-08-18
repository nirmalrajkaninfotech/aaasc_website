import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { CarouselItem } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'carousel.json');

async function readCarousel(): Promise<CarouselItem[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCarousel(items: CarouselItem[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET() {
  const items = await readCarousel();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = await readCarousel();
  const newItem: CarouselItem = {
    ...body,
    id: Date.now().toString(),
    order: items.length,
  };
  items.push(newItem);
  await writeCarousel(items);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const items = await readCarousel();
  const idx = items.findIndex((item) => item.id === body.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  items[idx] = { ...items[idx], ...body };
  await writeCarousel(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  let items = await readCarousel();
  items = items.filter((item) => item.id !== id);
  await writeCarousel(items);
  return NextResponse.json({ success: true });
}
