import mongoose from 'mongoose';
import { ENV } from './env.config.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    // Don't crash immediately in dev if DB is starting up, but log clearly
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error event:', err);
});
