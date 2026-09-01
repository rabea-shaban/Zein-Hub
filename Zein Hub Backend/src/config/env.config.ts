import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zein_hub',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // JWT Configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'zein_hub_access_super_secret_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'zein_hub_refresh_super_secret_key_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Super Admin Configuration
  SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@zeinhub.com',
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'Admin@ZeinHub2026!',
  SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE || '01000000000',
};
