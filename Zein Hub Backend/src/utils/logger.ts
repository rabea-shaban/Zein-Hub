import { ENV } from '../config/env.config.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'creditcard',
  'cvv',
];

function sanitizeForLogging(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }

  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeForLogging(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class Logger {
  public static log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? sanitizeForLogging(meta) : undefined;

    if (ENV.NODE_ENV === 'production') {
      const payload: Record<string, any> = {
        timestamp,
        level,
        message,
        environment: ENV.NODE_ENV,
        ...(sanitizedMeta ? { meta: sanitizedMeta } : {}),
      };
      console.log(JSON.stringify(payload));
    } else {
      const prefix = `[${timestamp}] [${level.toUpperCase()}]:`;
      if (sanitizedMeta) {
        console.log(`${prefix} ${message}`, sanitizedMeta);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  public static info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public static warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public static error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  public static debug(message: string, meta?: any): void {
    if (ENV.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }
}
