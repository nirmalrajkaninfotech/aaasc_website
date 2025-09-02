'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

// Helper function to safely get initials
const getInitials = (name?: string): string => {
  if (!name) return '??';
  return name.split(' ')
    .map(n => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export default function IQACSection({ iqacData }: IQACSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  // If no data provided, show loading state
  if (!iqacData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">IQAC Section Loading...</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 max-w-md mx-auto">
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

  const iqac = iqacData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'committee', label: 'Committee', icon: '👥' },
    { id: 'activities', label: 'Activities', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'practices', label: 'Best Practices', icon: '⭐' }
  ].filter(tab => tab.id === 'committee' ? true : (iqac?.enabled ? iqac.enabled[tab.id] !== false : true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
    

      {/* Navigation Container */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <nav className="flex space-x-1 md:space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 md:px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200`}
              >
                <span className="text-base md:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* About Section */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">ℹ️</span>
                    About IQAC
                  </h3>
                </div>
                <div className="p-6">
                  {iqac?.about?.description && (
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {iqac.about.description}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Objectives */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🎯</span>
                        Objectives
                      </h4>
                      <ul className="space-y-3">
                        {iqac?.about?.objectives && iqac.about.objectives.length > 0 ? (
                          iqac.about.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2 mt-1 flex-shrink-0">•</span>
                              <span className="text-gray-600">{objective}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No objectives listed.</li>
                        )}
                      </ul>
                    </div>

                    {/* Functions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">⚙️</span>
                        Functions
                      </h4>
                      <ul className="space-y-3">
                        {iqac?.about?.functions && iqac.about.functions.length > 0 ? (
                          iqac.about.functions.map((func, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-1 flex-shrink-0">•</span>
                              <span className="text-gray-600">{func}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No functions listed.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">⭐</span>
                    Best Practices
                  </h3>
                </div>
                <div className="p-6">
                  {iqac?.bestPractices && iqac.bestPractices.length > 0 ? (
                    <div className="grid gap-4">
                      {iqac.bestPractices.map((practice, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-l-4 border-green-500 bg-green-50 pl-4 py-3 rounded-r-lg"
                        >
                          <p className="text-gray-700">{practice}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No best practices available.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Committee Tab */}
          {activeTab === 'committee' && (
            <motion.div
              key="committee"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">👥</span>
                    IQAC Committee
                  </h3>
                </div>
                <div className="p-6">
                  {/* Leadership */}
                  {(iqac?.committee?.chairman || iqac?.committee?.coordinator) && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {/* Chairman */}
                      {iqac?.committee?.chairman && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                              {getInitials(iqac.committee.chairman.name)}
                            </div>
                            <div>
                              {iqac.committee.chairman.name && (
                                <h4 className="font-semibold text-gray-800">{iqac.committee.chairman.name}</h4>
                              )}
                              <p className="text-sm text-gray-600">{iqac.committee.chairman.role || 'Chairman'}</p>
                            </div>
                          </div>
                          {iqac.committee.chairman.designation && (
                            <p className="text-gray-700 text-sm">{iqac.committee.chairman.designation}</p>
                          )}
                          {iqac.committee.chairman.department && (
                            <p className="text-sm text-gray-600">{iqac.committee.chairman.department}</p>
                          )}
                        </div>
                      )}

                      {/* Coordinator */}
                      {iqac?.committee?.coordinator && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                              {getInitials(iqac.committee.coordinator.name)}
                            </div>
                            <div>
                              {iqac.committee.coordinator.name && (
                                <h4 className="font-semibold text-gray-800">{iqac.committee.coordinator.name}</h4>
                              )}
                              <p className="text-sm text-gray-600">{iqac.committee.coordinator.role || 'Coordinator'}</p>
                            </div>
                          </div>
                          {iqac.committee.coordinator.designation && (
                            <p className="text-gray-700 text-sm">{iqac.committee.coordinator.designation}</p>
                          )}
                          {iqac.committee.coordinator.department && (
                            <p className="text-sm text-gray-600">{iqac.committee.coordinator.department}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Members */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Committee Members</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {iqac?.committee?.members && iqac.committee.members.length > 0 ? (
                        iqac.committee.members.map((member, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                                {getInitials(member?.name)}
                              </div>
                              <div className="min-w-0">
                                {member?.name && (
                                  <h5 className="font-medium text-gray-800 text-sm truncate">{member.name}</h5>
                                )}
                              </div>
                            </div>
                            {member?.designation && (
                              <p className="text-xs text-gray-600 mb-1">{member.designation}</p>
                            )}
                            {member?.department && (
                              <p className="text-xs text-gray-500">{member.department}</p>
                            )}
                            {member?.role && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                                {member.role}
                              </span>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-full">No committee members listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'activities' || activeTab === 'reports' || activeTab === 'practices') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-lg rounded-lg p-8 text-center"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600">
                Content for {activeTab} tab will be displayed here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
