'use client';

import React, { useState } from 'react';

// === Type Definitions ===
type MemberRole = 'Chairman' | 'Coordinator' | 'Member' | 'External Expert' | 'Alumni' | 'Industry Expert';

interface IQACMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  role: MemberRole;
  email?: string;
  phone?: string;
  imageUrl?: string;
}

interface IIQACMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  agenda: string;
  minutes: string;
  decisions: string[];
  participants: string[];
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface IIQACReport {
  id: string;
  title: string;
  type: 'Annual' | 'AQAR' | 'NAAC' | 'Other';
  year: number;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  comments?: string;
}

interface INAACData {
  status: 'Accredited' | 'Not Accredited' | 'Applied' | 'Under Process' | 'Reaccreditation Due';
  grade: string;
  cgpa: number | null;
  validity: string;
  certificateUrl: string;
  ssrUrl: string;
  peerTeamReportUrl: string;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  coordinator: string;
  contactEmail: string;
  contactPhone: string;
}

interface IIQACAbout {
  description: string;
  objectives: string[];
  functions: string[];
  vision: string;
  mission: string;
  qualityPolicy: string;
  establishmentDate: string;
  lastUpdated: string;
}

interface IIQACCommittee {
  chairman: IQACMember;
  coordinator: IQACMember;
  members: IQACMember[];
  formationDate: string;
  tenure: string;
  termsOfReference: string[];
}

interface IAQARData {
  currentYear: number;
  reports: IIQACReport[];
}

interface IBestPractice {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  implementationDate: string;
  outcomes: string[];
  impact: string;
  supportingDocuments: string[];
  contactPerson: string;
  contactEmail: string;
}

interface IQualityInitiative {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Discontinued';
  objectives: string[];
  expectedOutcomes: string[];
  actualOutcomes?: string[];
  responsibleDepartment: string;
  budget?: number;
  budgetUtilized?: number;
  stakeholders: string[];
  successMetrics: string[];
  challenges: string[];
  lessonsLearned: string[];
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface IIQACData {
  about: IIQACAbout;
  committee: IIQACCommittee;
  meetings: IIQACMeeting[];
  reports: IIQACReport[];
  naac: INAACData;
  aqar: IAQARData;
  bestPractices: IBestPractice[];
  qualityInitiatives: IQualityInitiative[];
}

// === Static Data ===
const iqacData: IIQACData = {
  about: {
    description: 'The Internal Quality Assurance Cell (IQAC) is responsible for quality enhancement and monitoring of academic and administrative processes.',
    objectives: [
      'Promote quality consciousness among staff and students.',
      'Coordinate quality-related activities.',
      'Develop systems for feedback and improvement.',
    ],
    functions: [
      'Organize quality circles and workshops.',
      'Monitor academic standards.',
      'Prepare reports for NAAC and other bodies.',
    ],
    vision: 'To achieve excellence in teaching, research, and governance.',
    mission: 'To foster a culture of continuous improvement and quality enhancement.',
    qualityPolicy: 'Committed to quality education through innovation, feedback, and accountability.',
    establishmentDate: '2010-06-15',
    lastUpdated: '2023-12-01',
  },
  committee: {
    chairman: {
      id: '1',
      name: 'Dr. John Doe',
      designation: 'Principal',
      department: 'Management',
      role: 'Chairman',
      imageUrl: '/images/committee/chairman.jpg',
    },
    coordinator: {
      id: '2',
      name: 'Dr. Jane Smith',
      designation: 'Professor',
      department: 'Computer Science',
      role: 'Coordinator',
      imageUrl: '/images/committee/coordinator.jpg',
    },
    members: [
      {
        id: '3',
        name: 'Prof. Robert Johnson',
        designation: 'HOD',
        department: 'Mechanical Engineering',
        role: 'Member',
      },
      {
        id: '4',
        name: 'Dr. Emily Davis',
        designation: 'Professor',
        department: 'Electronics',
        role: 'Member',
      },
    ],
    formationDate: '2023-01-10',
    tenure: '2 Years',
    termsOfReference: ['Review academic programs', 'Monitor feedback systems', 'Prepare AQAR'],
  },
  meetings: [
    {
      id: 'm1',
      title: 'First IQAC Meeting 2023',
      date: '2023-04-15',
      time: '10:00 AM',
      location: 'Conference Hall',
      agenda: 'Annual Quality Assurance Report preparation and review',
      minutes: 'Discussed the preparation of AQAR 2022-23 and formed sub-committees.',
      decisions: ['Form sub-committees', 'Set deadlines for AQAR submission'],
      participants: ['Dr. John Doe', 'Dr. Jane Smith', 'Prof. Robert Johnson'],
      attachments: [
        {
          name: 'Agenda.pdf',
          url: '/meetings/m1/agenda.pdf',
          type: 'PDF',
          size: 1024,
        },
      ],
    },
  ],
  reports: [
    {
      id: 'r1',
      title: 'AQAR 2021-22',
      type: 'AQAR',
      year: 2022,
      fileUrl: '/reports/aqar-2021-22.pdf',
      fileSize: 2048000,
      fileType: 'PDF',
      uploadedAt: '2022-07-10',
      uploadedBy: 'Dr. Jane Smith',
      status: 'Approved',
    },
  ],
  naac: {
    status: 'Accredited',
    grade: 'A+',
    cgpa: 3.62,
    validity: '2026',
    certificateUrl: '/naac/certificate.pdf',
    ssrUrl: '/naac/ssr-2022.pdf',
    peerTeamReportUrl: '/naac/peer-team-report-2022.pdf',
    lastAssessmentDate: '2022-05-10',
    nextAssessmentDate: '2026-05-10',
    coordinator: 'Dr. Jane Smith',
    contactEmail: 'iqac@college.edu',
    contactPhone: '+91-9876543210',
  },
  aqar: {
    currentYear: 2023,
    reports: [],
  },
  bestPractices: [
    {
      id: 'bp1',
      title: 'Green Campus Initiative',
      description: 'Promoting sustainability through eco-friendly practices.',
      category: 'Environment',
      department: 'Administration',
      implementationDate: '2020-08-15',
      outcomes: ['Reduced carbon footprint', 'Increased green cover'],
      impact: 'Significant improvement in campus environment.',
      supportingDocuments: ['/bp/green-campus.pdf'],
      contactPerson: 'Dr. Emily Davis',
      contactEmail: 'emily@college.edu',
    },
  ],
  qualityInitiatives: [
    {
      id: 'qi1',
      title: 'Digital Learning Platform',
      description: 'Implementation of LMS for all courses.',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      status: 'In Progress',
      objectives: ['Improve access to resources', 'Enhance student engagement'],
      expectedOutcomes: ['100% course digitization', 'Improved feedback'],
      responsibleDepartment: 'IT & Academics',
      stakeholders: ['Faculty', 'Students', 'IT Staff'],
      successMetrics: ['Usage rate > 80%', 'Feedback score > 4/5'],
      challenges: ['Faculty training', 'Internet access'],
      lessonsLearned: ['Need phased rollout'],
      documents: [
        {
          name: 'Proposal.pdf',
          url: '/qi/digital-learning.pdf',
          type: 'PDF',
        },
      ],
    },
  ],
};

// === Components ===
function FileUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload and return file name as URL
      onChange(`/uploaded/${file.name}`);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={value}
        readOnly
        className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-50 text-sm"
        placeholder="No file selected"
      />
      <label className="px-4 py-2 bg-blue-600 text-white rounded-r-lg cursor-pointer hover:bg-blue-700">
        {label}
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}

// === Main Component ===
export default function IQACManager() {
  const [saving, setSaving] = useState(false);

  const saveIQACData = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert('IQAC data saved successfully!');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Internal Quality Assurance Cell (IQAC)</h1>
        <p className="text-gray-600">Ensuring quality enhancement in all academic and administrative aspects</p>
      </div>

      {/* About Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">About IQAC</h2>
        <p className="text-gray-700 mb-4">{iqacData.about.description}</p>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Vision</h3>
          <p className="text-gray-700 mb-6">{iqacData.about.vision}</p>

          <h3 className="text-xl font-semibold mb-3">Mission</h3>
          <p className="text-gray-700 mb-6">{iqacData.about.mission}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Objectives</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {iqacData.about.objectives.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Functions</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {iqacData.about.functions.map((func, index) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Committee Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">IQAC Committee</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Chairman</h3>
            <div className="flex items-center space-x-4">
              <img
                src={iqacData.committee.chairman.imageUrl || '/images/default-user.png'}
                alt="Chairman"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-lg font-bold">{iqacData.committee.chairman.name}</h4>
                <p className="text-gray-700">{iqacData.committee.chairman.designation}</p>
                <p className="text-sm text-gray-500">{iqacData.committee.chairman.department}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Coordinator</h3>
            <div className="flex items-center space-x-4">
              <img
                src={iqacData.committee.coordinator.imageUrl || '/images/default-user.png'}
                alt="Coordinator"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="text-lg font-bold">{iqacData.committee.coordinator.name}</h4>
                <p className="text-gray-700">{iqacData.committee.coordinator.designation}</p>
                <p className="text-sm text-gray-500">{iqacData.committee.coordinator.department}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Members</h3>
          <ul className="space-y-3">
            {iqacData.committee.members.map((member) => (
              <li key={member.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-medium">{member.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {member.designation}, {member.department}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Meetings Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Meetings</h2>
        <ul className="space-y-4">
          {iqacData.meetings.map((meeting) => (
            <li key={meeting.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-bold">{meeting.title}</h3>
              <p className="text-gray-600">
                {meeting.date} at {meeting.time} — {meeting.location}
              </p>
              <p className="mt-1 text-gray-700">{meeting.agenda}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Reports Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>
        <ul className="space-y-4">
          {iqacData.reports.map((report) => (
            <li key={report.id} className="border p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-bold">{report.title}</h3>
              <p className="text-gray-600">
                {report.type} Report • {report.year}
              </p>
              <a href={report.fileUrl} target="_blank" className="text-blue-600 hover:underline">
                View Report (PDF)
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* NAAC Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">NAAC Accreditation</h2>
        <p className="text-lg font-semibold text-green-700">{iqacData.naac.status}</p>
        {iqacData.naac.status === 'Accredited' && (
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800">Grade</h3>
              <p className="text-2xl font-bold">{iqacData.naac.grade}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800">CGPA</h3>
              <p className="text-2xl font-bold">{iqacData.naac.cgpa}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-purple-800">Valid Until</h3>
              <p className="text-2xl font-bold">{iqacData.naac.validity}</p>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Top
        </button>
        <button
          onClick={saveIQACData}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}