const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: env,
  
  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'https://serveraasc.veetusaapadu.in',
    credentials: true
  },
  
  // File upload configuration
  uploads: {
    directory: 'public/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

const environmentConfigs = {
  development: {
    // Development-specific overrides
    logLevel: 'dev'
  },
  production: {
    // Production-specific overrides
    logLevel: 'combined',
    cors: {
      ...baseConfig.cors,
      origin: process.env.FRONTEND_URL || 'https://your-production-domain.com'
    }
  }
};

// Merge base config with environment-specific config
const config = {
  ...baseConfig,
  ...(environmentConfigs[env] || {})
};

export default config;
