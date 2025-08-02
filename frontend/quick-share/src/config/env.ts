const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  APP_NAME: process.env.REACT_APP_APP_NAME || 'QuickDesk',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

export default config;