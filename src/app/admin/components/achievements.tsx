'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';

interface Achievement {
  id: string;
  title: string;
  content: string;
  image: string;
  alignment: 'left' | 'center' | 'right';
  published: boolean;
  images?: Array<{ url: string; caption: string; subtitle: string }>;
}

interface AchievementsData {
  title: string;
  subtitle: string;
  items: Achievement[];
}

export default function Achievements() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    title: '',
    content: '',
    image: '',
    alignment: 'left',
    published: true
  });
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch('/api/site');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleCreateAchievement = () => {
    if (!newAchievement.title?.trim()) {
      alert('Please enter a title');
      return;
    }

    const achievement: Achievement = {
      id: `achievement-${Date.now()}`,
      title: newAchievement.title,
      content: newAchievement.content || '',
      image: newAchievement.image || '',
      alignment: newAchievement.alignment || 'left',
      published: newAchievement.published || true,
      images: (newAchievement as any).images || []
    };

    const updatedSettings = {
      ...siteSettings!,
      achievements: {
        ...siteSettings!.achievements,
        items: [...(siteSettings!.achievements?.items || []), achievement]
      }
    };

    setSiteSettings(updatedSettings);
    setNewAchievement({ title: '', content: '', image: '', alignment: 'left', published: true });
    
    // Save to backend
    fetch('/api/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings),
    });
  };

  const handleUpdateAchievement = () => {
    if (!editingAchievement) return;

    const updatedSettings = {
      ...siteSettings!,
      achievements: {
        ...siteSettings!.achievements,
        items: siteSettings!.achievements.items.map((item: Achievement) =>
          item.id === editingAchievement.id ? editingAchievement : item
        )
      }
    };

    setSiteSettings(updatedSettings);
    setEditingAchievement(null);
    
    // Save to backend
    fetch('/api/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings),
    });
  };

  const handleDeleteAchievement = (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    const updatedSettings = {
      ...siteSettings!,
      achievements: {
        ...siteSettings!.achievements,
        items: siteSettings!.achievements.items.filter((item: Achievement) => item.id !== id)
      }
    };

    setSiteSettings(updatedSettings);
    
    // Save to backend
    fetch('/api/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings),
    });
  };

  const handleSaveSiteSettings = async () => {
    if (!siteSettings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });

      if (res.ok) {
        alert('Site settings saved successfully!');
      } else {
        alert('Failed to save site settings');
      }
    } catch (error) {
      alert('Error saving site settings');
    } finally {
      setSaving(false);
    }
  };

  if (!siteSettings) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Achievements Section Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={siteSettings.achievements?.title || ''}
              onChange={(e) => setSiteSettings({
                ...siteSettings,
                achievements: { ...siteSettings.achievements, title: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Subtitle
            </label>
            <input
              type="text"
              value={siteSettings.achievements?.subtitle || ''}
              onChange={(e) => setSiteSettings({
                ...siteSettings,
                achievements: { ...siteSettings.achievements, subtitle: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Create New Achievement */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New Achievement</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newAchievement.title || ''}
              onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter achievement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={newAchievement.content || ''}
              onChange={(content: string) => setNewAchievement({ ...newAchievement, content })}
              placeholder="Enter achievement content with rich formatting..."
            />
          </div>

          <div>
            <ImageUpload
              value={newAchievement.image || ''}
              onChange={(image: string) => setNewAchievement({ ...newAchievement, image })}
              label="Primary Image (optional)"
            />
          </div>

          <div>
            <MultiImageUpload
              label="Additional Images (with captions/subtitles)"
              onUpload={(urls: string[]) => setNewAchievement({
                ...newAchievement,
                images: [
                  ...((newAchievement as any).images || []),
                  ...urls.map(u => ({ url: u, caption: '', subtitle: '' }))
                ]
              })}
            />
            {newAchievement.images && (newAchievement as any).images.length > 0 && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(newAchievement as any).images.map((img: any, i: number) => (
                  <div key={`${img.url}-${i}`} className="border rounded overflow-hidden">
                    <div className="relative h-28">
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </div>
                    <div className="p-2 space-y-2">
                      <label className="block text-xs text-gray-600 mb-1">Caption</label>
                      <RichTextEditor
                        value={img.caption || ''}
                        onChange={(value: string) => {
                          const nextImgs = [ ...((newAchievement as any).images || []) ];
                          nextImgs[i] = { ...nextImgs[i], caption: value };
                          setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                        }}
                        placeholder="Write caption..."
                      />
                      <label className="block text-xs text-gray-600 mb-1 mt-2">Subcaption</label>
                      <RichTextEditor
                        value={img.subtitle || ''}
                        onChange={(value: string) => {
                          const nextImgs = [ ...((newAchievement as any).images || []) ];
                          nextImgs[i] = { ...nextImgs[i], subtitle: value };
                          setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                        }}
                        placeholder="Write subcaption..."
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Drag to reorder</span>
                        <button className="text-red-600 text-xs" onClick={()=>{
                          const nextImgs = ((newAchievement as any).images || []).filter((_: any, k: number) => k !== i);
                          setNewAchievement({ ...(newAchievement as any), images: nextImgs } as any);
                        }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Alignment
              </label>
              <select
                value={newAchievement.alignment || 'left'}
                onChange={(e) => setNewAchievement({ ...newAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
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
                id="achievement-published"
                checked={newAchievement.published || false}
                onChange={(e) => setNewAchievement({ ...newAchievement, published: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="achievement-published" className="text-sm font-medium text-gray-700">
                Published
              </label>
            </div>
          </div>

          <button
            onClick={handleCreateAchievement}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Achievement
          </button>
        </div>
      </div>

      {/* Existing Achievements */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Existing Achievements</h2>
        {!siteSettings.achievements?.items || siteSettings.achievements.items.length === 0 ? (
          <p className="text-gray-500">No achievements yet.</p>
        ) : (
          <div className="space-y-4">
            {siteSettings.achievements.items.map((achievement: Achievement) => (
              <div key={achievement.id} className="border border-gray-200 p-4 rounded-md">
                {editingAchievement?.id === achievement.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingAchievement.title}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <RichTextEditor
                      value={editingAchievement.content || ''}
                      onChange={(content: string) => setEditingAchievement({ ...editingAchievement, content })}
                      placeholder="Edit achievement content..."
                    />
                    <ImageUpload
                      value={editingAchievement.image || ''}
                      onChange={(image: string) => setEditingAchievement({ ...editingAchievement, image })}
                    />
                    <div>
                      <MultiImageUpload
                        label="Additional Images (with captions/subtitles)"
                        onUpload={(urls: string[]) => setEditingAchievement({
                          ...editingAchievement,
                          images: [
                            ...((editingAchievement as any).images || []),
                            ...urls.map(u => ({ url: u, caption: '', subtitle: '' }))
                          ]
                        })}
                      />
                      {(editingAchievement as any).images && (editingAchievement as any).images.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(editingAchievement as any).images.map((img: any, i: number) => (
                            <div key={`${img.url}-${i}`} className="border rounded overflow-hidden">
                              <div className="relative h-28">
                                <Image src={img.url} alt="" fill className="object-cover" />
                              </div>
                              <div className="p-2 space-y-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Caption</label>
                                  <RichTextEditor
                                    value={img.caption || ''}
                                    onChange={(value: string) => {
                                      const nextImgs = [ ...((editingAchievement as any).images || []) ];
                                      nextImgs[i] = { ...nextImgs[i], caption: value };
                                      setEditingAchievement({ ...(editingAchievement as any), images: nextImgs } as any);
                                    }}
                                    placeholder="Write caption..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Subcaption</label>
                                  <RichTextEditor
                                    value={img.subtitle || ''}
                                    onChange={(value: string) => {
                                      const nextImgs = [ ...((editingAchievement as any).images || []) ];
                                      nextImgs[i] = { ...nextImgs[i], subtitle: value };
                                      setEditingAchievement({ ...(editingAchievement as any), images: nextImgs } as any);
                                    }}
                                    placeholder="Write subcaption..."
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Drag to reorder</span>
                                  <button className="text-red-600 text-xs" onClick={()=>{
                                    const nextImgs = ((editingAchievement as any).images || []).filter((_: any, k: number) => k !== i);
                                    setEditingAchievement({ ...(editingAchievement as any), images: nextImgs } as any);
                                  }}>Remove</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={editingAchievement.alignment}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, alignment: e.target.value as 'left' | 'center' | 'right' })}
                        className="p-2 border border-gray-300 rounded-md"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingAchievement.published}
                          onChange={(e) => setEditingAchievement({ ...editingAchievement, published: e.target.checked })}
                          className="mr-2"
                        />
                        Published
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateAchievement}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAchievement(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">
                        {achievement.alignment} aligned • {achievement.published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAchievement(achievement)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(achievement.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSaveSiteSettings}
          disabled={saving}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}