import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitizes objects against NoSQL injection ($ and . in keys)
 */
function sanitizeNoSqlData(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSqlData);
  }

  const clean: any = {};
  for (const key of Object.keys(obj)) {
    // If key starts with $ or contains ., strip or skip it to prevent NoSQL operator injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeNoSqlData(obj[key]);
  }
  return clean;
}

/**
 * Recursively sanitizes strings against dangerous XSS scripts (<script>, javascript: pseudo-protocol)
 */
function sanitizeXssData(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeXssData);
  }

  const clean: any = {};
  for (const key of Object.keys(obj)) {
    clean[key] = sanitizeXssData(obj[key]);
  }
  return clean;
}

/**
 * Middleware: NoSQL Injection & XSS Sanitization
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeXssData(sanitizeNoSqlData(req.body));
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeXssData(sanitizeNoSqlData(req.params));
  }

  if (req.query && typeof req.query === 'object') {
    const cleanQuery = sanitizeXssData(sanitizeNoSqlData(req.query));
    try {
      Object.keys(req.query).forEach((k) => delete (req.query as any)[k]);
      Object.assign(req.query, cleanQuery);
    } catch {
      Object.defineProperty(req, 'query', {
        value: cleanQuery,
        writable: true,
        configurable: true,
      });
    }
  }

  next();
};

/**
 * Middleware: Custom Production HTTP Security Headers
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.removeHeader('X-Powered-By');
  next();
};
