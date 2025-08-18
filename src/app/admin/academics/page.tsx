'use client';

import { useState, useEffect } from 'react';
import { AcademicSection, AcademicProgram } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';
import Image from 'next/image';

export default function AcademicsAdmin() {
  const [academic, setAcademic] = useState<AcademicSection>({
    title: 'Academic Programs',
    subtitle: 'Explore our diverse range of academic programs',
    programs: [],
    additionalInfo: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<AcademicProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programs');

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      const response = await fetch('/api/academics');
      const data = await response.json();
      if (data) setAcademic(data);
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(academic),
      });

      if (!response.ok) throw new Error('Failed to save academic data');
      alert('Academic data saved successfully!');
      setIsEditing(false);
      setCurrentProgram(null);
      fetchAcademicData();
    } catch (error) {
      console.error('Error saving academic data:', error);
      alert('Failed to save academic data');
    }
  };

  // ... (rest of the component code remains the same)
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Academic Programs Management</h1>
      
      {isEditing ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Section Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={academic.title}
                  onChange={(e) => setAcademic({ ...academic, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={academic.subtitle}
                  onChange={(e) => setAcademic({ ...academic, subtitle: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Academic Programs</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Academic Section
            </button>
          </div>
          
          <p className="text-gray-600">
            Manage academic programs, including their details, duration, and other relevant information.
          </p>
        </div>
      )}
    </div>
  );
}
