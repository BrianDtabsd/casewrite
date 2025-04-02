/**
 * Application configuration settings
 */

// Load environment variables
require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-key',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']
  },

  // Database configuration
  database: {
    // PostgreSQL configuration
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'casewrite',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      ssl: process.env.POSTGRES_SSL === 'true'
    },
    
    // MongoDB configuration (if used)
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/casewrite',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  },

  // Integration configuration
  integration: {
    enabled: process.env.INTEGRATION_ENABLED === 'true',
    standaloneMode: process.env.STANDALONE_MODE === 'true',
    hrCaseManagement: {
      apiUrl: process.env.HR_CASE_MANAGEMENT_API_URL || 'http://localhost:4000/api',
      apiKey: process.env.HR_CASE_MANAGEMENT_API_KEY || ''
    }
  },

  // AI service configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10)
    }
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    oauth: {
      clientId: process.env.OAUTH_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
      tokenUrl: process.env.OAUTH_TOKEN_URL || '',
      authorizationUrl: process.env.OAUTH_AUTHORIZATION_URL || '',
      callbackUrl: process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/api/auth/callback'
    }
  },

  // Storage configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', etc.
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads'
    },
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'casewrite.log'
  }
};

module.exports = config;
