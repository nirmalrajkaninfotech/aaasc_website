'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AdminDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ token, user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [collages, setCollages] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'site') {
        const response = await api.site();
        if (response.data) {
          setSiteSettings(response.data);
        }
      } else if (activeTab === 'collages') {
        const response = await api.collages();
        if (response.data) {
          setCollages(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSiteSetting = async (key: string, value: string) => {
    try {
      const response = await api.updateSite(token, { [key]: value });
      if (response.error) {
        setMessage(`Error: ${response.error}`);
      } else {
        setMessage('Setting updated successfully!');
        setSiteSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      setMessage('Failed to update setting');
    }
  };

  const renderSiteSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Site Settings</h3>
      {Object.entries(siteSettings).map(([key, value]) => (
        <div key={key} className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateSiteSetting(key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );

  const renderCollages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Collages ({collages.length})</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add New
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collages.map((collage) => (
          <div key={collage.id} className="border rounded-lg p-4">
            <h4 className="font-semibold">{collage.title}</h4>
            <p className="text-sm text-gray-600">{collage.category}</p>
            <p className="text-xs text-gray-500">{collage.images?.length || 0} images</p>
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Edit
              </button>
              <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['site', 'collages', 'placements', 'achievements', 'faculty', 'gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl">Loading...</div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              {activeTab === 'site' && renderSiteSettings()}
              {activeTab === 'collages' && renderCollages()}
              {activeTab === 'placements' && <div>Placements management coming soon...</div>}
              {activeTab === 'achievements' && <div>Achievements management coming soon...</div>}
              {activeTab === 'faculty' && <div>Faculty management coming soon...</div>}
              {activeTab === 'gallery' && <div>Gallery management coming soon...</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
