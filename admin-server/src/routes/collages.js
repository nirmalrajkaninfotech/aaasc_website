import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const COLLEGES_FILE = 'collages';

// Default college structure
const defaultCollege = {
  id: '',
  name: '',
  code: '',
  description: '',
  establishedYear: '',
  principal: {
    name: '',
    qualification: '',
    email: '',
    phone: ''
  },
  contact: {
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: ''
  },
  departments: [],
  facilities: [],
  accreditation: {
    naac: {
      grade: '',
      validTill: '',
      certificateUrl: ''
    },
    aicteApproval: {
      approvalNo: '',
      validTill: '',
      certificateUrl: ''
    },
    ugcRecognition: {
      status: '',
      certificateUrl: ''
    }
  },
  stats: {
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    passPercentage: 0,
    placementPercentage: 0
  },
  gallery: [],
  isActive: true,
  createdAt: '',
  updatedAt: ''
};

// Helper function to get all colleges
const getColleges = () => {
  return readJsonFile(COLLEGES_FILE) || [];
};

// Helper function to get college by ID
const getCollegeById = (id) => {
  const colleges = getColleges();
  return colleges.find(college => college.id === id);
};

// GET /api/collages - Get all colleges (public)
router.get('/', 
  asyncHandler(async (req, res) => {
    const { active, search, sortBy, sortOrder = 'asc' } = req.query;
    let colleges = getColleges();
    
    // Filter by active status if provided
    if (active !== undefined) {
      const isActive = active === 'true';
      colleges = colleges.filter(college => college.isActive === isActive);
    }
    
    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      colleges = colleges.filter(college => 
        college.name.toLowerCase().includes(searchTerm) ||
        college.code.toLowerCase().includes(searchTerm) ||
        college.description.toLowerCase().includes(searchTerm) ||
        college.contact.city.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sorting
    if (sortBy) {
      colleges.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'establishedYear':
            comparison = a.establishedYear - b.establishedYear;
            break;
          case 'city':
            comparison = a.contact.city.localeCompare(b.contact.city);
            break;
          default:
            // Default sort by name
            comparison = a.name.localeCompare(b.name);
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    res.json(colleges);
  })
);

// GET /api/collages/:id - Get single college by ID (public)
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const college = getCollegeById(id);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json(college);
  })
);

// POST /api/collages - Create new college (protected)
router.post('/', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const {
      name,
      code,
      description,
      establishedYear,
      principal,
      contact,
      accreditation,
      stats,
      departments = [],
      facilities = [],
      gallery = []
    } = req.body;
    
    // Basic validation
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    // Check if college with same code already exists
    const colleges = getColleges();
    const codeExists = colleges.some(college => college.code === code);
    if (codeExists) {
      return res.status(400).json({ error: 'College with this code already exists' });
    }
    
    const newCollege = {
      ...defaultCollege,
      id: Date.now().toString(),
      name,
      code,
      description: description || '',
      establishedYear: establishedYear || new Date().getFullYear(),
      principal: {
        ...defaultCollege.principal,
        ...principal
      },
      contact: {
        ...defaultCollege.contact,
        ...contact
      },
      accreditation: {
        ...defaultCollege.accreditation,
        ...accreditation
      },
      stats: {
        ...defaultCollege.stats,
        ...stats
      },
      departments,
      facilities,
      gallery,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    colleges.push(newCollege);
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.status(201).json(newCollege);
  })
);

// PUT /api/collages/:id - Update college (protected)
router.put('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    // Prevent changing college code to one that already exists
    if (updates.code && updates.code !== colleges[collegeIndex].code) {
      const codeExists = colleges.some(college => 
        college.code === updates.code && college.id !== id
      );
      
      if (codeExists) {
        return res.status(400).json({ error: 'Another college with this code already exists' });
      }
    }
    
    const updatedCollege = {
      ...colleges[collegeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Ensure ID remains unchanged
    updatedCollege.id = id;
    
    colleges[collegeIndex] = updatedCollege;
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.json(updatedCollege);
  })
);

// DELETE /api/collages/:id - Delete college (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const colleges = getColleges();
    const filteredColleges = colleges.filter(college => college.id !== id);
    
    if (filteredColleges.length === colleges.length) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    writeJsonFile(COLLEGES_FILE, filteredColleges);
    
    res.json({ success: true, message: 'College deleted successfully' });
  })
);

// Department Management

// POST /api/collages/:id/departments - Add department to college (protected)
router.post('/:id/departments', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, hod, description, email, phone } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required for department' });
    }
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    // Check if department with same code already exists
    const deptExists = colleges[collegeIndex].departments.some(
      dept => dept.code === code
    );
    
    if (deptExists) {
      return res.status(400).json({ error: 'Department with this code already exists' });
    }
    
    const newDepartment = {
      id: Date.now().toString(),
      name,
      code,
      hod: hod || '',
      description: description || '',
      email: email || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    colleges[collegeIndex].departments.push(newDepartment);
    colleges[collegeIndex].updatedAt = new Date().toISOString();
    
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.status(201).json(newDepartment);
  })
);

// PUT /api/collages/:id/departments/:deptId - Update department (protected)
router.put('/:id/departments/:deptId', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id, deptId } = req.params;
    const updates = req.body;
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    const deptIndex = colleges[collegeIndex].departments.findIndex(
      dept => dept.id === deptId
    );
    
    if (deptIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Prevent changing department code to one that already exists
    if (updates.code && updates.code !== colleges[collegeIndex].departments[deptIndex].code) {
      const codeExists = colleges[collegeIndex].departments.some(
        dept => dept.code === updates.code && dept.id !== deptId
      );
      
      if (codeExists) {
        return res.status(400).json({ error: 'Another department with this code already exists' });
      }
    }
    
    const updatedDepartment = {
      ...colleges[collegeIndex].departments[deptIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Ensure ID remains unchanged
    updatedDepartment.id = deptId;
    
    colleges[collegeIndex].departments[deptIndex] = updatedDepartment;
    colleges[collegeIndex].updatedAt = new Date().toISOString();
    
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.json(updatedDepartment);
  })
);

// DELETE /api/collages/:id/departments/:deptId - Remove department (protected)
router.delete('/:id/departments/:deptId', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id, deptId } = req.params;
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    const initialLength = colleges[collegeIndex].departments.length;
    colleges[collegeIndex].departments = colleges[collegeIndex].departments.filter(
      dept => dept.id !== deptId
    );
    
    if (colleges[collegeIndex].departments.length === initialLength) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    colleges[collegeIndex].updatedAt = new Date().toISOString();
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.json({ success: true, message: 'Department deleted successfully' });
  })
);

// Gallery Management

// POST /api/collages/:id/gallery - Add image to college gallery (protected)
router.post('/:id/gallery', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageUrl, caption, category } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    const newImage = {
      id: Date.now().toString(),
      imageUrl,
      caption: caption || '',
      category: category || 'general',
      uploadedAt: new Date().toISOString()
    };
    
    if (!colleges[collegeIndex].gallery) {
      colleges[collegeIndex].gallery = [];
    }
    
    colleges[collegeIndex].gallery.unshift(newImage);
    colleges[collegeIndex].updatedAt = new Date().toISOString();
    
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.status(201).json(newImage);
  })
);

// DELETE /api/collages/:id/gallery/:imageId - Remove image from gallery (protected)
router.delete('/:id/gallery/:imageId', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id, imageId } = req.params;
    
    const colleges = getColleges();
    const collegeIndex = colleges.findIndex(college => college.id === id);
    
    if (collegeIndex === -1) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    if (!colleges[collegeIndex].gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }
    
    const initialLength = colleges[collegeIndex].gallery.length;
    colleges[collegeIndex].gallery = colleges[collegeIndex].gallery.filter(
      img => img.id !== imageId
    );
    
    if (colleges[collegeIndex].gallery.length === initialLength) {
      return res.status(404).json({ error: 'Image not found in gallery' });
    }
    
    colleges[collegeIndex].updatedAt = new Date().toISOString();
    writeJsonFile(COLLEGES_FILE, colleges);
    
    res.json({ success: true, message: 'Image removed from gallery' });
  })
);

export default router;
