export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRES_IN = '7d';
export const SALT_ROUNDS = 10;

export const ORDER_STATUSES = ['pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'failed'];
export const USER_ROLES = ['user', 'admin'];

export const API_PROVIDER = {
  baseURL: process.env.API_PROVIDER_URL || '',
  apiKey: process.env.API_PROVIDER_KEY || '',
};
