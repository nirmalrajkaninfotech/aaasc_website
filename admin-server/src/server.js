import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { existsSync, mkdirSync } from 'fs';
import fsPromises from 'fs/promises';

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
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => {
    // Skip rate limiting for static files and health check
    return req.path.startsWith('/public/') || req.path === '/health';
  }
});

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

// Cookie parser
app.use(cookieParser());

// Trust first proxy (important for secure cookies in production)
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = [
  'http://localhost:3003',
  'http://localhost:3002',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://72.60.96.178',
  'http://127.0.0.1:3001',
  'https://aaasc.edu.in',
  'https://www.aaasc.edu.in',
  'https://admin.aaasc.edu.in'
];

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3003',
      'http://localhost:3002',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://72.60.96.178',
      'http://127.0.0.1:3001',
      'https://aaasc.edu.in',
      'https://www.aaasc.edu.in',
      'https://admin.aaasc.edu.in'
    ];

    // Allow requests with no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With', 'Referer'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Explicit OPTIONS handler before other middleware
app.options('*', cors(corsOptions), (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    const parsedOrigin = new URL(origin).origin;
    res.setHeader('Access-Control-Allow-Origin', parsedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With, Referer');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  res.status(204).end();
});

// Apply CORS to all routes
app.use(cors(corsOptions));

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
app.use('/api/academics', academicsRoutes);  // This will handle both /api/academics and /api/academics/public
app.use('/api/alumni', alumniRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/iqac', iqacRoutes);
app.use('/api/admission-forms', admissionFormsRoutes);
app.use('/api/collages', collagesRoutes);
app.use('/api/header3', header3Routes);

// Add a fallback public endpoint that returns sample collages data
app.get('/api/collages/public', async (req, res) => {
  try {
    const dataPath = join(__dirname, '..', 'data', 'collages.json');
    const raw = await fsPromises.readFile(dataPath, 'utf8');
    const json = JSON.parse(raw);
    return res.json(json);
  } catch (err) {
    console.error('Failed to load sample collages data', err);
    // Return an empty array to keep the frontend stable
    return res.json({ collages: [] });
  }
});

// Protected routes
app.use('/api/carousel', carouselRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin/admission-forms', admissionFormsRoutes);
app.use('/api/admin/collages', collagesRoutes);
app.use('/api/admin/header3', header3Routes);

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
  // Set CORS headers for all requests - allow all origins
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
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

// Keep a single default export
export default server;
