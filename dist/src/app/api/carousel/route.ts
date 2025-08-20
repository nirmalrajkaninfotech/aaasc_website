import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CarouselItem } from '@/types';

const sitePath = path.join(process.cwd(), 'data', 'site.json');

function readSiteJson(): any {
  try {
    const data = fs.readFileSync(sitePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function writeSiteJson(siteData: any): void {
  fs.writeFileSync(sitePath, JSON.stringify(siteData, null, 2));
}

function readCarouselItems(): CarouselItem[] {
  const siteData = readSiteJson();
  return siteData.carousel?.items || [];
}

function writeCarouselItems(items: CarouselItem[]): void {
  const siteData = readSiteJson();
  if (!siteData.carousel) {
    siteData.carousel = { title: 'Main Carousel', subtitle: '', items: [] };
  }
  siteData.carousel.items = items;
  writeSiteJson(siteData);
}

export async function GET() {
  try {
    const items = readCarouselItems();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read carousel items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();
    let items = readCarouselItems();
    // Generate ID if not provided
    if (!newItem.id) {
      newItem.id = Date.now().toString();
    }
    // Set order to be last if not provided
    if (newItem.order === undefined) {
      const maxOrder = items.length > 0 ? Math.max(...items.map(item => item.order || 0)) : 0;
      newItem.order = maxOrder + 1;
    }
    // Prevent duplicate IDs
    items = items.filter(item => item.id !== newItem.id);
    items.push(newItem);
    writeCarouselItems(items);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create carousel item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();
    const items = readCarouselItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    items[index] = updatedItem;
    writeCarouselItems(items);
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update carousel item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const items = readCarouselItems();
    const filteredItems = items.filter(item => item.id !== id);
    if (items.length === filteredItems.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    writeCarouselItems(filteredItems);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete carousel item' }, { status: 500 });
  }
}