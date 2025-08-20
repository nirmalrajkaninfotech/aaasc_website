'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import MultiImageUpload from '@/components/MultiImageUpload';

interface Placement {
  id: string;
  title: string;
  content: string;
  images: string[];
  alignment: 'left' | 'center' | 'right';
  published: boolean;
}

export default function Placements() {
  const [placementSectionTitle, setPlacementSectionTitle] = useState('');
  const [placementSectionSubtitle, setPlacementSectionSubtitle] = useState('');
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);
  const [saving, setSaving] = useState(false);
  const imageDragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const response = await fetch('/api/placements');
      if (response.ok) {
        const data = await response.json();
        setPlacementSectionTitle(data.title || '');
        setPlacementSectionSubtitle(data.subtitle || '');
        setPlacements(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setLoadingPlacements(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section settings (single card) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Placement Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              value={placementSectionTitle}
              onChange={(e) => setPlacementSectionTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Student Placements"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              value={placementSectionSubtitle}
              onChange={(e) => setPlacementSectionSubtitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Our graduates excel in top companies worldwide."
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Single card editor for the placement content/images */}
          {loadingPlacements ? (
            <div className="py-8 text-center text-gray-500">Loading placement content...</div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Main Description</label>
              <RichTextEditor
                value={placements[0]?.content || ''}
                onChange={(content) => {
                  if (placements.length === 0) {
                    setPlacements([{ id: crypto.randomUUID(), title: 'Placement', content, images: [], alignment: 'left', published: true }]);
                  } else {
                    const updated = [...placements];
                    updated[0] = { ...updated[0], content };
                    setPlacements(updated);
                  }
                }}
                placeholder="Write placement description..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <MultiImageUpload
                  onUpload={(urls: string[]) => {
                    if (placements.length === 0) {
                      setPlacements([{ id: crypto.randomUUID(), title: 'Placement', content: '', images: urls, alignment: 'left', published: true }]);
                    } else {
                      const updated = [...placements];
                      updated[0] = { ...updated[0], images: [...(updated[0].images || []), ...urls] };
                      setPlacements(updated);
                    }
                  }}
                  label="Upload Images"
                />
                <div className="flex flex-wrap gap-3 mt-3">
                  {(placements[0]?.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 group cursor-move"
                      draggable
                      onDragStart={() => { imageDragIndexRef.current = idx; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = imageDragIndexRef.current;
                        const to = idx;
                        if (from === null || from === to) return;
                        const current = placements[0]?.images || [];
                        const reordered = [...current];
                        const [moved] = reordered.splice(from, 1);
                        reordered.splice(to, 0, moved);
                        const updated = [...placements];
                        updated[0] = { ...updated[0], images: reordered };
                        setPlacements(updated);
                        imageDragIndexRef.current = null;
                      }}
                    >
                      <img src={img} alt="" className="object-cover w-full h-full rounded-md border border-gray-200" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const updated = [...placements];
                          updated[0] = { ...updated[0], images: updated[0].images.filter((_, i) => i !== idx) };
                          setPlacements(updated);
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Title</label>
                  <input
                    type="text"
                    value={placements[0]?.title || ''}
                    onChange={(e) => {
                      if (placements.length === 0) {
                        setPlacements([{ id: crypto.randomUUID(), title: e.target.value, content: '', images: [], alignment: 'left', published: true }]);
                      } else {
                        const updated = [...placements];
                        updated[0] = { ...updated[0], title: e.target.value };
                        setPlacements(updated);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                  <select
                    value={placements[0]?.alignment || 'left'}
                    onChange={(e) => {
                      if (placements.length === 0) return;
                      const updated = [...placements];
                      updated[0] = { ...updated[0], alignment: e.target.value as 'left' | 'center' | 'right' };
                      setPlacements(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="placement-single-published"
                    checked={placements[0]?.published ?? true}
                    onChange={(e) => {
                      if (placements.length === 0) return;
                      const updated = [...placements];
                      updated[0] = { ...updated[0], published: e.target.checked };
                      setPlacements(updated);
                    }}
                    className="mr-2 h-5 w-5 text-blue-600"
                  />
                  <label htmlFor="placement-single-published" className="text-sm font-medium text-gray-700">Published</label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const body = {
                        title: placementSectionTitle,
                        subtitle: placementSectionSubtitle,
                        items: placements,
                      };
                      await fetch('/api/placements', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                      });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}