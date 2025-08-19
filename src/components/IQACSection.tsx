'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface IQACData {
  title: string;
  subtitle: string;
  heroImage: string;
  enabled?: { [key: string]: boolean };
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

interface IQACSectionProps {
  iqacData: IQACData | null;
}

export default function IQACSection({ iqacData }: IQACSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!iqacData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">IQAC Section Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'committee', label: 'Committee', icon: '👥' },
    { id: 'activities', label: 'Activities', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'practices', label: 'Best Practices', icon: '⭐' }
  ].filter(tab => (iqacData.enabled ? iqacData.enabled[tab.id] !== false : true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={iqacData.heroImage}
            alt="IQAC Hero"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-4">{iqacData.title}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">{iqacData.subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {activeTab === 'overview' && (iqacData.enabled ? iqacData.enabled.overview !== false : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{iqacData.mission.title}</h3>
                <p className="text-gray-600 leading-relaxed">{iqacData.mission.content}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{iqacData.vision.title}</h3>
                <p className="text-gray-600 leading-relaxed">{iqacData.vision.content}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Objectives</h3>
                <ul className="space-y-3">
                  {iqacData.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1">•</span>
                      <span className="text-gray-600">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Functions</h3>
                <ul className="space-y-3">
                  {iqacData.functions.map((func, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1">•</span>
                      <span className="text-gray-600">{func}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'committee' && (iqacData.enabled ? iqacData.enabled.committee !== false : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-8">{iqacData.committee.title}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {iqacData.committee.members.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h4>
                    <p className="text-blue-600 font-semibold mb-1">{member.position}</p>
                    <p className="text-gray-600 text-sm">{member.designation}</p>
                    <p className="text-gray-500 text-sm">{member.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'activities' && (iqacData.enabled ? iqacData.enabled.activities !== false : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Recent Activities</h3>
            <div className="space-y-6">
              {iqacData.activities.map((activity, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{activity.title}</h4>
                      <p className="text-gray-600 mt-2">{activity.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Date: {new Date(activity.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (iqacData.enabled ? iqacData.enabled.reports !== false : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Reports & Documents</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {iqacData.reports.map((report, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{report.title}</h4>
                  <p className="text-gray-600 mb-4">Date: {new Date(report.date).toLocaleDateString()}</p>
                  <a
                    href={report.file}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'practices' && (iqacData.enabled ? iqacData.enabled.practices !== false : true) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-8">Best Practices</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {iqacData.bestPractices.map((practice, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-600">{practice}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}