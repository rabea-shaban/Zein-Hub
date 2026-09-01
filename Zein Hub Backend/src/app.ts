import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env.config.js';
import apiRouter from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { sanitizeInput, securityHeaders } from './middlewares/security.middleware.js';
import { HealthController } from './modules/health/health.controller.js';
import { swaggerSpec } from './config/swagger.config.js';

const app: Application = express();

// Trust proxy for rate limiter if deployed behind load balancers/reverse proxies
app.set('trust proxy', 1);

// 1. Security Headers via Helmet & Custom Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disabled for Swagger UI assets compatibility
  })
);
app.use(securityHeaders);

// 2. CORS configuration with credentials support for httpOnly cookies
app.use(
  cors({
    origin: ENV.CLIENT_URL || true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    credentials: true,
  })
);

// 3. Response Compression (Optimized for JSON APIs > 1KB)
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// 4. Request Logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// 5. Body & Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 6. Global Input Sanitization (NoSQL Injection & XSS Protection)
app.use(sanitizeInput);

// 7. Interactive Swagger API Documentation UI
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Zein Hub Media LMS — API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  })
);
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 8. Root Health Check Endpoint
app.get('/health', HealthController.getHealth);

// 9. Global Rate Limiter applied to API endpoints
app.use('/api', globalRateLimiter);

// 10. API Version 1 Routes
app.use('/api/v1', apiRouter);

// 11. 404 Handler for undefined routes
app.use(notFound);

// 12. Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
