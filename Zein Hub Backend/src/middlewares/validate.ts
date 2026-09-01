import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';
import { ApiError } from '../utils/apiError.js';

interface RequestValidationSchema {
  body?: Schema;
  query?: Schema;
  params?: Schema;
  headers?: Schema;
}

export const validate = (schema: RequestValidationSchema | Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // If a raw Joi schema is provided directly, default to validating req.body
    const isJoiSchema = Joi.isSchema(schema);
    const targetSchema: RequestValidationSchema = isJoiSchema
      ? { body: schema as Schema }
      : (schema as RequestValidationSchema);

    const validationTargets: Array<keyof RequestValidationSchema> = ['body', 'query', 'params', 'headers'];
    const collectedErrors: string[] = [];

    for (const target of validationTargets) {
      if (targetSchema[target]) {
        const { error, value } = targetSchema[target]!.validate(req[target], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const messages = error.details.map((detail) => detail.message.replace(/['"]/g, ''));
          collectedErrors.push(...messages);
        } else {
          // Safely set stripped value on req object without failing on getters
          try {
            if (target === 'query') {
              Object.keys(req.query).forEach((k) => delete (req.query as any)[k]);
              Object.assign(req.query, value);
            } else {
              req[target] = value;
            }
          } catch {
            Object.defineProperty(req, target, {
              value,
              writable: true,
              configurable: true,
            });
          }
        }
      }
    }

    if (collectedErrors.length > 0) {
      return next(ApiError.badRequest('Validation Error', collectedErrors));
    }

    next();
  };
};
