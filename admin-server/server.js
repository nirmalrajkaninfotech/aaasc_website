const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database initialization
const { initializeDatabase } = require('./database/init');
const { authenticateToken } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/site');
const collagesRoutes = require('./routes/collages');
const placementsRoutes = require('./routes/placements');
const achievementsRoutes = require('./routes/achievements');
const iqacRoutes = require('./routes/iqac');
const alumniRoutes = require('./routes/alumni');
const carouselRoutes = require('./routes/carousel');
const academicsRoutes = require('./routes/academics');
const uploadRoutes = require('./routes/upload');

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/site', authenticateToken, siteRoutes);
app.use('/api/collages', authenticateToken, collagesRoutes);
app.use('/api/placements', authenticateToken, placementsRoutes);
app.use('/api/achievements', authenticateToken, achievementsRoutes);
app.use('/api/iqac', authenticateToken, iqacRoutes);
app.use('/api/alumni', authenticateToken, alumniRoutes);
app.use('/api/carousel', authenticateToken, carouselRoutes);
app.use('/api/academics', authenticateToken, academicsRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);

// Public routes (no authentication required)
app.get('/api/site/public', async (req, res) => {
  try {
    const siteData = await fs.readFile(path.join(__dirname, '../data/site.json'), 'utf8');
    res.json(JSON.parse(siteData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load site data' });
  }
});

app.get('/api/collages/public', async (req, res) => {
  try {
    const collagesData = await fs.readFile(path.join(__dirname, '../data/collages.json'), 'utf8');
    res.json(JSON.parse(collagesData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load collages data' });
  }
});

app.get('/api/academics/public', async (req, res) => {
  try {
    const academicsData = await fs.readFile(path.join(__dirname, '../data/academics.json'), 'utf8');
    res.json(JSON.parse(academicsData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load academics data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Admin server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
