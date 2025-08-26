'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface CommitteeMember {
  name: string;
  designation: string;
  department?: string;
  role?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  venue: string;
  agenda: string;
  minutes: string;
  attendees: string[];
}

interface Report {
  id: string;
  title: string;
  year: string;
  file: string;
}

interface NAACData {
  status: 'Accredited' | 'Not Accredited' | 'Under Process';
  grade: string;
  cgpa: string | null;
  validity: string;
  certificateUrl: string;
  ssrUrl: string;
  peerTeamReportUrl: string;
}

interface AQARData {
  currentYear: number;
  reports: Report[];
}

interface IQACData {
  about: {
    description: string;
    objectives: string[];
    functions: string[];
  };
  committee: {
    chairman: CommitteeMember;
    coordinator: CommitteeMember;
    members: CommitteeMember[];
  };
  meetings: Meeting[];
  reports: Report[];
  naac: NAACData;
  aqar: AQARData;
  bestPractices: string[];
  qualityInitiatives: string[];
  heroImage: string;
  enabled?: {
    [key: string]: boolean;
  };
}

interface IQACSectionProps {
  iqacData: IQACData | null;
}

export default function IQACSection({ iqacData }: IQACSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IQACData | null>(iqacData ?? null);
  const [loading, setLoading] = useState<boolean>(!iqacData);

  useEffect(() => {
    // if parent provided data, use it; otherwise fetch from backend
    if (iqacData) {
      setData(iqacData);
      setLoading(false);
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';
    let mounted = true;
    setLoading(true);
    fetch(`${API_BASE}/api/iqac`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json: IQACData) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to fetch IQAC data', err);
        setError('Failed to load IQAC data from backend');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [iqacData]);

  // show existing loading/error UI while we have no data
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">IQAC Section Loading...</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // local variable for rendering
  const iqac = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'committee', label: 'Committee', icon: '👥' },
    { id: 'activities', label: 'Activities', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'practices', label: 'Best Practices', icon: '⭐' }
  ].filter(tab => tab.id === 'committee' ? true : (iqac.enabled ? iqac.enabled[tab.id] !== false : true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-96 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={iqac.heroImage || '/images/iqac-hero.jpg'}
            alt="IQAC Hero"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="mt-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* About Section */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">About IQAC</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {iqac.about.description || 'No description available.'}
                  </p>
                </div>

                {/* Objectives */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Objectives</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {iqac.about.objectives?.length > 0 ? (
                      iqac.about.objectives.map((objective, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {objective}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No objectives listed.</li>
                    )}
                  </ul>
                </div>

                {/* Functions */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Functions</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {iqac.about.functions?.length > 0 ? (
                      iqac.about.functions.map((func, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {func}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No functions listed.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Best Practices</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  {iqac.bestPractices && iqac.bestPractices.length > 0 ? (
                    iqac.bestPractices.map((practice, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="text-gray-600">{practice}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No best practices available.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}