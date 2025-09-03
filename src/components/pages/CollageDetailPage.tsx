'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-utils';
import { Collage } from '@/types';
import Image from 'next/image';
import { HashLink } from '@/components/HashRouter';
import { getImageUrl } from '@/config';

interface CollageDetailPageProps {
  id: string;
}

export default function CollageDetailPage({ id }: CollageDetailPageProps) {
  const [collage, setCollage] = useState<Collage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const numericId = Number(id);

        // 1) Try single-item endpoint first
        try {
          const res = await fetch(`${API_BASE_URL}/api/collages/${encodeURIComponent(id)}`);
          if (res.ok) {
            const data = await res.json();
            setCollage(data);
            return;
          }
        } catch {}

        // 2) Fallback: fetch list and pick by id
        const listRes = await fetch(`${API_BASE_URL}/api/collages`);
        if (!listRes.ok) throw new Error('Failed to fetch');
        const list: Collage[] = await listRes.json();
        const match = list.find(item => Number(item.id) === numericId);
        if (!match) throw new Error('Not found');
        setCollage(match);
      } catch (e) {
        setError('Failed to load collage');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !collage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Collage not found'}</p>
          <HashLink to="/gallery" className="text-blue-600 underline">Back to Gallery</HashLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <HashLink to="/gallery" className="text-blue-600 hover:underline">← Back to Gallery</HashLink>
      </div>

      <h1 className="text-3xl font-bold mb-4">{collage.title}</h1>
      {collage.description && (
        <p className="text-gray-600 mb-6">{collage.description}</p>
      )}

      {collage.images && collage.images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collage.images.map((img, idx) => {
            const url = typeof img === 'string' ? img : (img.url || '');
            const alt = typeof img === 'string' ? collage.title : (img.caption || collage.title);
            return (
              <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={getImageUrl(url)}
                  alt={alt}
                  fill
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(collage.image || '')}
            alt={collage.title}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}