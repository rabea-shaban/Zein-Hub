import app from './app.js';
import { ENV } from './config/env.config.js';
import { connectDB } from './config/db.config.js';
import mongoose from 'mongoose';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  const server = app.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Zein Hub Backend Server Running!`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🌐 Port: ${ENV.PORT}`);
    console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`=========================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful Shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
