'use client';

import { useState, useEffect } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface IQACData {
  title: string;
  subtitle: string;
  heroImage: string;
  mission: { title: string; content: string };
  vision: { title: string; content: string };
  objectives: string[];
  functions: string[];
  committee: {
    title: string;
    members: Array<{
      name: string;
      position: string;
      designation: string;
      department: string;
    }>;
  };
  activities: Array<{
    title: string;
    description: string;
    date: string;
    status: string;
  }>;
  reports: Array<{
    title: string;
    file: string;
    date: string;
  }>;
  bestPractices: string[];
}

export default function IQACManager() {
  const [iqacData, setIqacData] = useState<IQACData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIQACData();
  }, []);

  const fetchIQACData = async () => {
    try {
      const response = await fetch('/api/iqac');
      const data = await response.json();
      setIqacData(data);
    } catch (error) {
      console.error('Error fetching IQAC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIQACData = async () => {
    if (!iqacData) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/iqac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(iqacData),
      });
      
      if (response.ok) {
        alert('IQAC data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving IQAC data:', error);
      alert('Error saving IQAC data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!iqacData) return <div className="p-8">Error loading IQAC data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">IQAC Management</h2>
        <button
          onClick={saveIQACData}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={iqacData.title}
            onChange={(e) => setIqacData({ ...iqacData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input
            type="text"
            value={iqacData.subtitle}
            onChange={(e) => setIqacData({ ...iqacData, subtitle: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hero Image</label>
          <ImageUpload
            value={iqacData.heroImage}
            onChange={(url) => setIqacData({ ...iqacData, heroImage: url })}
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Mission</h3>
          <RichTextEditor
            value={iqacData.mission.content}
            onChange={(content) => setIqacData({
              ...iqacData,
              mission: { ...iqacData.mission, content }
            })}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Vision</h3>
          <RichTextEditor
            value={iqacData.vision.content}
            onChange={(content) => setIqacData({
              ...iqacData,
              vision: { ...iqacData.vision, content }
            })}
          />
        </div>
      </div>

      {/* Committee Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Committee Members</h3>
        {iqacData.committee.members.map((member, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={member.name}
                onChange={(e) => {
                  const newMembers = [...iqacData.committee.members];
                  newMembers[index].name = e.target.value;
                  setIqacData({
                    ...iqacData,
                    committee: { ...iqacData.committee, members: newMembers }
                  });
                }}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Position"
                value={member.position}
                onChange={(e) => {
                  const newMembers = [...iqacData.committee.members];
                  newMembers[index].position = e.target.value;
                  setIqacData({
                    ...iqacData,
                    committee: { ...iqacData.committee, members: newMembers }
                  });
                }}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Designation"
                value={member.designation}
                onChange={(e) => {
                  const newMembers = [...iqacData.committee.members];
                  newMembers[index].designation = e.target.value;
                  setIqacData({
                    ...iqacData,
                    committee: { ...iqacData.committee, members: newMembers }
                  });
                }}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Department"
                value={member.department}
                onChange={(e) => {
                  const newMembers = [...iqacData.committee.members];
                  newMembers[index].department = e.target.value;
                  setIqacData({
                    ...iqacData,
                    committee: { ...iqacData.committee, members: newMembers }
                  });
                }}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Activities</h3>
        {iqacData.activities.map((activity, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Activity Title"
                value={activity.title}
                onChange={(e) => {
                  const newActivities = [...iqacData.activities];
                  newActivities[index].title = e.target.value;
                  setIqacData({ ...iqacData, activities: newActivities });
                }}
                className="px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={activity.description}
                onChange={(e) => {
                  const newActivities = [...iqacData.activities];
                  newActivities[index].description = e.target.value;
                  setIqacData({ ...iqacData, activities: newActivities });
                }}
                className="px-3 py-2 border rounded-lg"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={activity.date}
                  onChange={(e) => {
                    const newActivities = [...iqacData.activities];
                    newActivities[index].date = e.target.value;
                    setIqacData({ ...iqacData, activities: newActivities });
                  }}
                  className="px-3 py-2 border rounded-lg"
                />
                <select
                  value={activity.status}
                  onChange={(e) => {
                    const newActivities = [...iqacData.activities];
                    newActivities[index].status = e.target.value;
                    setIqacData({ ...iqacData, activities: newActivities });
                  }}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}