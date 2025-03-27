const env = process.env.NODE_ENV || 'development';

interface Config {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

const config: { [key: string]: Config } = {
  development: {
    apiBaseUrl: 'http://localhost:8000',
    wsBaseUrl: 'ws://localhost:8000'
  },
  production: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sahara.com',
    wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL || 'wss://api.sahara.com'
  },
  test: {
    apiBaseUrl: 'http://localhost:8000',
    wsBaseUrl: 'ws://localhost:8000'
  }
};

export const currentConfig = config[env];