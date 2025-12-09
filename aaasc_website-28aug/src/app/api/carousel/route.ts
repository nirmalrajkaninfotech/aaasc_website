import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CarouselItem } from '@/types';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/cors';

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

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return handleOptionsRequest(origin);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const items = readCarouselItems();
    const response = NextResponse.json(items);
    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = NextResponse.json({ error: 'Failed to read carousel items' }, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

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
    const response = NextResponse.json(newItem, { status: 201 });
    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = NextResponse.json({ error: 'Failed to create carousel item' }, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}

export async function PUT(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const updatedItem = await request.json();
    const items = readCarouselItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      const response = NextResponse.json({ error: 'Item not found' }, { status: 404 });
      return addCorsHeaders(response, origin);
    }
    items[index] = updatedItem;
    writeCarouselItems(items);
    const response = NextResponse.json(updatedItem);
    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = NextResponse.json({ error: 'Failed to update carousel item' }, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      const response = NextResponse.json({ error: 'ID is required' }, { status: 400 });
      return addCorsHeaders(response, origin);
    }
    const items = readCarouselItems();
    const filteredItems = items.filter(item => item.id !== id);
    if (items.length === filteredItems.length) {
      const response = NextResponse.json({ error: 'Item not found' }, { status: 404 });
      return addCorsHeaders(response, origin);
    }
    writeCarouselItems(filteredItems);
    const response = NextResponse.json({ success: true });
    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = NextResponse.json({ error: 'Failed to delete carousel item' }, { status: 500 });
    return addCorsHeaders(response, origin);
  }
}