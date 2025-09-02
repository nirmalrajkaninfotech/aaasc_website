import express from 'express';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const FORMS_FILE = 'admission-forms';
const SUBMISSIONS_FILE = 'admission-submissions';

// Default form structure
const defaultForm = {
  id: '',
  title: 'Admission Form',
  description: 'Fill out this form to apply for admission',
  academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  isActive: false,
  startDate: '',
  endDate: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fields: [
    {
      id: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
      validation: {
        minLength: 3,
        maxLength: 100
      }
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter your email',
      validation: {
        pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$'
      }
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter your phone number'
    },
    {
      id: 'course',
      label: 'Course Applying For',
      type: 'select',
      required: true,
      options: [
        { label: 'B.Sc Computer Science', value: 'bsc-cs' },
        { label: 'B.Com', value: 'bcom' },
        { label: 'BBA', value: 'bba' },
        { label: 'BA English', value: 'ba-english' }
      ]
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true
    },
    {
      id: 'address',
      label: 'Permanent Address',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your complete address'
    },
    {
      id: 'qualification',
      label: 'Highest Qualification',
      type: 'text',
      required: true,
      placeholder: 'E.g., 12th Standard, Diploma, etc.'
    },
    {
      id: 'documents',
      label: 'Upload Documents',
      type: 'file',
      required: false,
      accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
      multiple: true,
      description: 'Upload your mark sheets, ID proof, and other relevant documents'
    }
  ]
};

// Helper function to get all forms
const getForms = () => {
  return readJsonFile(FORMS_FILE) || [];
};

// Helper function to get form by ID
const getFormById = (id) => {
  const forms = getForms();
  return forms.find(form => form.id === id);
};

// Helper function to get all submissions
const getSubmissions = () => {
  return readJsonFile(SUBMISSIONS_FILE) || [];
};

// GET /api/admission-forms - Get all admission forms (protected)
router.get('/', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const forms = getForms();
    res.json(forms);
  })
);

// GET /api/admission-forms/active - Get active admission form (public)
router.get('/active', 
  asyncHandler(async (req, res) => {
    const forms = getForms();
    const activeForm = forms.find(form => form.isActive);
    
    if (!activeForm) {
      return res.status(404).json({ 
        error: 'No active admission form found',
        isActive: false
      });
    }
    
    // Don't include submission data in public endpoint
    const { submissions, ...formData } = activeForm;
    res.json({
      ...formData,
      isActive: true
    });
  })
);

// GET /api/admission-forms/:id - Get form by ID (protected)
router.get('/:id', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const form = getFormById(id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  })
);

// POST /api/admission-forms - Create new admission form (protected)
router.post('/', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { title, description, academicYear, fields, startDate, endDate } = req.body;
    
    if (!title || !academicYear) {
      return res.status(400).json({ error: 'Title and academic year are required' });
    }
    
    const forms = getForms();
    const formId = Date.now().toString();
    
    const newForm = {
      ...defaultForm,
      id: formId,
      title,
      description: description || defaultForm.description,
      academicYear,
      startDate: startDate || '',
      endDate: endDate || '',
      fields: fields || defaultForm.fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Only one form can be active at a time
    if (newForm.isActive) {
      forms.forEach(form => {
        if (form.isActive) form.isActive = false;
      });
    }
    
    forms.push(newForm);
    writeJsonFile(FORMS_FILE, forms);
    
    res.status(201).json(newForm);
  })
);

// PUT /api/admission-forms/:id - Update admission form (protected)
router.put('/:id', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const forms = getForms();
    const formIndex = forms.findIndex(form => form.id === id);
    
    if (formIndex === -1) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Only one form can be active at a time
    if (updates.isActive) {
      forms.forEach(form => {
        if (form.id !== id && form.isActive) form.isActive = false;
      });
    }
    
    const updatedForm = {
      ...forms[formIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    forms[formIndex] = updatedForm;
    writeJsonFile(FORMS_FILE, forms);
    
    res.json(updatedForm);
  })
);

// DELETE /api/admission-forms/:id - Delete admission form (protected)
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const forms = getForms();
    const filteredForms = forms.filter(form => form.id !== id);
    
    if (filteredForms.length === forms.length) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    writeJsonFile(FORMS_FILE, filteredForms);
    
    // Also delete related submissions
    const submissions = getSubmissions();
    const filteredSubmissions = submissions.filter(sub => sub.formId !== id);
    
    if (filteredSubmissions.length !== submissions.length) {
      writeJsonFile(SUBMISSIONS_FILE, filteredSubmissions);
    }
    
    res.json({ success: true, message: 'Form deleted successfully' });
  })
);

// Form Submission Endpoints

// POST /api/admission-forms/:id/submit - Submit admission form (public)
router.post('/:id/submit', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { formData, files } = req.body;
    
    // Verify form exists and is active
    const form = getFormById(id);
    if (!form || !form.isActive) {
      return res.status(400).json({ error: 'This form is not currently accepting submissions' });
    }
    
    // Check if submission period is valid
    const currentDate = new Date();
    if (form.startDate && new Date(form.startDate) > currentDate) {
      return res.status(400).json({ error: 'Form submission has not started yet' });
    }
    
    if (form.endDate && new Date(form.endDate) < currentDate) {
      return res.status(400).json({ error: 'Form submission has ended' });
    }
    
    // Basic validation of required fields
    const requiredFields = form.fields.filter(field => field.required);
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!formData[field.id] || formData[field.id].trim() === '') {
        missingFields.push(field.label);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }
    
    // Additional validation based on field type
    const validationErrors = [];
    
    form.fields.forEach(field => {
      const value = formData[field.id];
      if (!value) return;
      
      if (field.type === 'email' && field.validation?.pattern) {
        const emailRegex = new RegExp(field.validation.pattern);
        if (!emailRegex.test(value)) {
          validationErrors.push(`Invalid email format for ${field.label}`);
        }
      }
      
      if (field.type === 'text' || field.type === 'textarea') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          validationErrors.push(
            `${field.label} must be at least ${field.validation.minLength} characters`
          );
        }
        
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          validationErrors.push(
            `${field.label} must not exceed ${field.validation.maxLength} characters`
          );
        }
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Process file uploads if any
    const processedFiles = [];
    if (files && Object.keys(files).length > 0) {
      for (const [fieldId, fileList] of Object.entries(files)) {
        const field = form.fields.find(f => f.id === fieldId);
        if (!field || field.type !== 'file') continue;
        
        // In a real app, you would upload files to cloud storage here
        // For this example, we'll just store the file metadata
        processedFiles.push({
          fieldId,
          fieldName: field.label,
          files: Array.isArray(fileList) 
            ? fileList.map(file => ({
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                url: `/uploads/admissions/${file.filename}`
              }))
            : [{
                originalName: fileList.originalname,
                mimeType: fileList.mimetype,
                size: fileList.size,
                url: `/uploads/admissions/${fileList.filename}`
              }]
        });
      }
    }
    
    // Create submission record
    const submissions = getSubmissions();
    const submissionId = Date.now().toString();
    
    const newSubmission = {
      id: submissionId,
      formId: id,
      formTitle: form.title,
      formVersion: form.updatedAt,
      formData,
      files: processedFiles,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    submissions.push(newSubmission);
    writeJsonFile(SUBMISSIONS_FILE, submissions);
    
    // Update form with submission count
    const forms = getForms();
    const formIndex = forms.findIndex(f => f.id === id);
    if (formIndex !== -1) {
      if (!forms[formIndex].submissionCount) {
        forms[formIndex].submissionCount = 0;
      }
      forms[formIndex].submissionCount++;
      forms[formIndex].updatedAt = new Date().toISOString();
      writeJsonFile(FORMS_FILE, forms);
    }
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      submissionId,
      submissionDate: newSubmission.submittedAt
    });
  })
);

// GET /api/admission-forms/:id/submissions - Get form submissions (protected)
router.get('/:id/submissions', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    // Verify form exists
    const form = getFormById(id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Get all submissions for this form
    const submissions = getSubmissions()
      .filter(sub => sub.formId === id)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Apply status filter if provided
    const filteredSubmissions = status 
      ? submissions.filter(sub => sub.status === status)
      : submissions;
    
    // Apply pagination
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = pageInt * limitInt;
    
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);
    
    res.json({
      total: filteredSubmissions.length,
      page: pageInt,
      totalPages: Math.ceil(filteredSubmissions.length / limitInt),
      submissions: paginatedSubmissions
    });
  })
);

// GET /api/admission-forms/submissions/:id - Get submission by ID (protected)
router.get('/submissions/:id', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const submission = getSubmissions().find(sub => sub.id === id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    // Get form data to include field metadata
    const form = getFormById(submission.formId);
    
    res.json({
      submission,
      form: {
        id: form?.id,
        title: form?.title,
        fields: form?.fields || []
      }
    });
  })
);

// PUT /api/admission-forms/submissions/:id/status - Update submission status (protected)
router.put('/submissions/:id/status', 
  authenticate,
  authorize(['admin', 'admission']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const submissions = getSubmissions();
    const submissionIndex = submissions.findIndex(sub => sub.id === id);
    
    if (submissionIndex === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const updatedSubmission = {
      ...submissions[submissionIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Add status update to history
    if (!updatedSubmission.statusHistory) {
      updatedSubmission.statusHistory = [];
    }
    
    updatedSubmission.statusHistory.push({
      status,
      changedAt: new Date().toISOString(),
      changedBy: req.user?.id || 'system',
      notes: notes || ''
    });
    
    submissions[submissionIndex] = updatedSubmission;
    writeJsonFile(SUBMISSIONS_FILE, submissions);
    
    res.json({
      success: true,
      message: 'Submission status updated',
      submission: updatedSubmission
    });
  })
);

export default router;
