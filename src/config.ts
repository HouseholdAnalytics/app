// В production API запросы идут через /api
export const API_URL = '/api';

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not defined in environment variables, using /api prefix');
} 