import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';

// Import routes
import carouselRoutes from './routes/carousel.js';
import uploadRoutes from './routes/upload.js';
import academicsRoutes from './routes/academics.js';
import authRoutes from './routes/auth.js';
import siteRoutes from './routes/site.js';
import galleryRoutes from './routes/gallery.js';
import alumniRoutes from './routes/alumni.js';
import placementsRoutes from './routes/placements.js';
import iqacRoutes from './routes/iqac.js';
import admissionFormsRoutes from './routes/admission-forms.js';
import collagesRoutes from './routes/collages.js';
import header3Routes from './routes/header3.js';

// Import middleware
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { authenticate, authorize } from './middleware/auth.js';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Security
//app.use(helmet({
//  contentSecurityPolicy: false
//}));

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://aaasc.edu.in',
  'https://www.aaasc.edu.in',
  'https://admin.aaasc.edu.in'
];

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    if (allowedOrigins.includes(origin) || /(\.|^)aaasc\.edu\.in$/.test(origin)) {
      return callback(null, origin);
    }
    
    return callback(new Error(`❌ CORS not allowed for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS to all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(config.logLevel));

// Apply rate limiting
app.use('/api/', limiter);

/* ======================
   API Routes
====================== */

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/academics/public', academicsRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/iqac/public', iqacRoutes);
app.use('/api/admission-forms', admissionFormsRoutes);
app.use('/api/collages', collagesRoutes);
app.use('/api/header3', header3Routes);

// Protected routes
app.use('/api/carousel', authenticate, carouselRoutes);
app.use('/api/upload', authenticate, uploadRoutes);
app.use('/api/academics', authenticate, academicsRoutes);
app.use('/api/gallery', authenticate, galleryRoutes);
app.use('/api/iqac', authenticate, iqacRoutes);
app.use('/api/admin/admission-forms', authenticate, authorize(['admin', 'admission']), admissionFormsRoutes);
app.use('/api/admin/collages', authenticate, authorize(['admin']), collagesRoutes);
app.use('/api/admin/header3', authenticate, authorize(['admin', 'editor']), header3Routes);

/* ======================
   Static File Serving
====================== */
const uploadsDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Serve static files with CORS
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all requests
  const origin = req.headers.origin;
  if (origin) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      res.header('Access-Control-Allow-Origin', origin);
    }
    // In production, only allow from allowedOrigins
    else if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
}, express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set cache control for images
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

/* ======================
   Health & Errors
====================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(notFound);
app.use(errorHandler);

/* ======================
   Start Server
====================== */
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default server;
