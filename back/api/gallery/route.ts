import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const sitePath = path.join(process.cwd(), 'data', 'site.json');

function readSiteJson() {
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

function readGalleryItems() {
  const siteData = readSiteJson();
  return siteData.gallery?.items || [];
}

function writeGalleryItems(items: any[]): void {
  const siteData = readSiteJson();
  if (!siteData.gallery) {
    siteData.gallery = { title: 'Gallery', subtitle: '', items: [] };
  }
  siteData.gallery.items = items;
  writeSiteJson(siteData);
}

export async function GET() {
  try {
    const items = readGalleryItems();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read gallery items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();
    let items = readGalleryItems();
    if (!newItem.id) {
      newItem.id = Date.now().toString();
    }
    if (newItem.order === undefined) {
      const maxOrder = items.length > 0 ? Math.max(...items.map(item => item.order || 0)) : 0;
      newItem.order = maxOrder + 1;
    }
    items = items.filter(item => item.id !== newItem.id);
    items.push(newItem);
    writeGalleryItems(items);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();
    const items = readGalleryItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    items[index] = updatedItem;
    writeGalleryItems(items);
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const items = readGalleryItems();
    const filteredItems = items.filter(item => item.id !== id);
    if (items.length === filteredItems.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    writeGalleryItems(filteredItems);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
