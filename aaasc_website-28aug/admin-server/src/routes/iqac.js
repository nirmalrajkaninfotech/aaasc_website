import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const IQAC_FILE = 'iqac';

// Default IQAC structure
const defaultIqacData = {
  about: {
    description: 'The Internal Quality Assurance Cell (IQAC) is a significant part of the institution\'s system for quality assurance. It is a facilitative and participative system that works towards ensuring quality in all aspects of the institution\'s functioning.',
    objectives: [
      'To develop a system for conscious, consistent, and catalytic action to improve the academic and administrative performance of the institution.',
      'To promote measures for institutional functioning towards quality enhancement through internalization of quality culture and institutionalization of best practices.'
    ],
    functions: [
      'Development and application of quality benchmarks/parameters for various academic and administrative activities of the institution',
      'Facilitating the creation of a learner-centric environment conducive to quality education',
      'Documentation of the various programs/activities leading to quality improvement'
    ]
  },
  committee: {
    chairman: {
      name: 'Principal',
      designation: 'Chairman'
    },
    coordinator: {
      name: '',
      designation: 'IQAC Coordinator'
    },
    members: []
  },
  meetings: [],
  reports: [],
  naac: {
    status: 'Not Accredited', // 'Accredited', 'Not Accredited', 'Under Process'
    grade: '',
    cgpa: null,
    validity: '',
    certificateUrl: '',
    ssrUrl: '',
    peerTeamReportUrl: ''
  },
  aqar: {
    currentYear: new Date().getFullYear(),
    reports: []
  },
  bestPractices: [],
  qualityInitiatives: []
};

// Helper function to get IQAC data with defaults
const getIqacData = () => {
  const data = readJsonFile(IQAC_FILE);
  return { ...defaultIqacData, ...data };
};

// GET /api/iqac - Get all IQAC data
router.get('/', 
  asyncHandler(async (req, res) => {
    const iqacData = getIqacData();
    res.json(iqacData);
  })
);

// GET /api/iqac/public - Get public IQAC data
router.get('/public', 
  asyncHandler(async (req, res) => {
    const { about, committee, naac, aqar, bestPractices, qualityInitiatives } = getIqacData();
    
    // Filter out sensitive information for public view
    const publicData = {
      about,
      committee: {
        ...committee,
        // Only include names and designations, no contact details
        members: committee.members.map(member => ({
          name: member.name,
          designation: member.designation
        }))
      },
      naac: {
        status: naac.status,
        grade: naac.grade,
        validity: naac.validity,
        certificateUrl: naac.certificateUrl
      },
      aqar: {
        currentYear: aqar.currentYear,
        reports: aqar.reports.map(report => ({
          year: report.year,
          title: report.title,
          url: report.url
        }))
      },
      bestPractices: bestPractices.filter(p => p.isPublished),
      qualityInitiatives: qualityInitiatives.filter(i => i.isPublished)
    };
    
    res.json(publicData);
  })
);

// POST /api/iqac - Update IQAC data (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const updates = req.body;
    const currentData = getIqacData();
    
    // Merge updates with current data
    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(IQAC_FILE, updatedData);
    
    res.json({
      success: true,
      message: 'IQAC data updated successfully',
      data: updatedData
    });
  })
);

// Committee Member Routes

// POST /api/iqac/committee/members - Add committee member (protected)
router.post('/committee/members', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { name, designation, department, email, phone, role } = req.body;
    
    if (!name || !designation) {
      return res.status(400).json({ error: 'Name and designation are required' });
    }
    
    const iqacData = getIqacData();
    const newMember = {
      id: Date.now().toString(),
      name,
      designation,
      department: department || '',
      email: email || '',
      phone: phone || '',
      role: role || 'Member',
      addedAt: new Date().toISOString()
    };
    
    iqacData.committee.members.push(newMember);
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.status(201).json(newMember);
  })
);

// PUT /api/iqac/committee/members/:id - Update committee member (protected)
router.put('/committee/members/:id', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const iqacData = getIqacData();
    const memberIndex = iqacData.committee.members.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Committee member not found' });
    }
    
    iqacData.committee.members[memberIndex] = {
      ...iqacData.committee.members[memberIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.json(iqacData.committee.members[memberIndex]);
  })
);

// DELETE /api/iqac/committee/members/:id - Remove committee member (protected)
router.delete('/committee/members/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const iqacData = getIqacData();
    const initialLength = iqacData.committee.members.length;
    
    iqacData.committee.members = iqacData.committee.members.filter(m => m.id !== id);
    
    if (iqacData.committee.members.length === initialLength) {
      return res.status(404).json({ error: 'Committee member not found' });
    }
    
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.json({ success: true, message: 'Committee member removed successfully' });
  })
);

// Meeting Routes

// POST /api/iqac/meetings - Add IQAC meeting (protected)
router.post('/meetings', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { title, date, time, venue, agenda, minutes, attendees } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }
    
    const iqacData = getIqacData();
    const newMeeting = {
      id: Date.now().toString(),
      title,
      date,
      time: time || '10:00 AM',
      venue: venue || 'IQAC Meeting Room',
      agenda: agenda || [],
      minutes: minutes || '',
      attendees: attendees || [],
      createdAt: new Date().toISOString()
    };
    
    iqacData.meetings.unshift(newMeeting);
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.status(201).json(newMeeting);
  })
);

// GET /api/iqac/meetings - Get all IQAC meetings
router.get('/meetings', 
  asyncHandler(async (req, res) => {
    const { limit, year } = req.query;
    let meetings = getIqacData().meetings;
    
    // Filter by year if provided
    if (year) {
      meetings = meetings.filter(meeting => {
        const meetingYear = new Date(meeting.date).getFullYear();
        return meetingYear === parseInt(year);
      });
    }
    
    // Sort by date (newest first)
    meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply limit if provided
    if (limit) {
      meetings = meetings.slice(0, parseInt(limit));
    }
    
    res.json(meetings);
  })
);

// NAAC Related Routes

// POST /api/iqac/naac - Update NAAC information (protected)
router.post('/naac', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const updates = req.body;
    const iqacData = getIqacData();
    
    iqacData.naac = {
      ...iqacData.naac,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.json({
      success: true,
      message: 'NAAC information updated successfully',
      data: iqacData.naac
    });
  })
);

// AQAR Routes

// POST /api/iqac/aqar - Add AQAR report (protected)
router.post('/aqar', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { year, title, description, fileUrl } = req.body;
    
    if (!year || !title || !fileUrl) {
      return res.status(400).json({ error: 'Year, title, and file URL are required' });
    }
    
    const iqacData = getIqacData();
    const newAqarReport = {
      id: Date.now().toString(),
      year: parseInt(year),
      title,
      description: description || '',
      fileUrl,
      createdAt: new Date().toISOString()
    };
    
    iqacData.aqar.reports.unshift(newAqarReport);
    
    // Update current year if this is the latest report
    if (newAqarReport.year > iqacData.aqar.currentYear) {
      iqacData.aqar.currentYear = newAqarReport.year;
    }
    
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.status(201).json(newAqarReport);
  })
);

// Best Practices & Quality Initiatives

// POST /api/iqac/best-practices - Add best practice (protected)
router.post('/best-practices', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { title, description, category, outcomes, isPublished } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    
    const iqacData = getIqacData();
    const newPractice = {
      id: Date.now().toString(),
      title,
      description,
      category,
      outcomes: outcomes || [],
      isPublished: !!isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    iqacData.bestPractices.unshift(newPractice);
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.status(201).json(newPractice);
  })
);

// POST /api/iqac/quality-initiatives - Add quality initiative (protected)
router.post('/quality-initiatives', 
  authenticate,
  authorize(['admin', 'iqac']),
  asyncHandler(async (req, res) => {
    const { title, description, category, startDate, endDate, isPublished } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    
    const iqacData = getIqacData();
    const newInitiative = {
      id: Date.now().toString(),
      title,
      description,
      category,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      isPublished: !!isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    iqacData.qualityInitiatives.unshift(newInitiative);
    writeJsonFile(IQAC_FILE, iqacData);
    
    res.status(201).json(newInitiative);
  })
);

export default router;
