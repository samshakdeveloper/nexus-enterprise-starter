import { Request, Response, NextFunction } from 'express';
import { BaseError } from '@shared/core/errors/base.error';
import { logger } from '@shared/infrastructure/logger';
import { env } from '@config/env.config';
import { CORRELATION_ID_HEADER } from '../correlation-id.middleware';

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const correlationId = (req?.headers?.[CORRELATION_ID_HEADER] as string) || 'N/A';

    if (error instanceof BaseError) {
        if (error.statusCode >= 500) {
            logger.error(`[${correlationId}] Server Error [${error.code}]: ${error.message}`, {
                stack: error.stack,
                details: error.details,
            });
        } else {
            logger.warn(`[${correlationId}] Client Error [${error.code}]: ${error.message}`, {
                details: error.details,
            });
        }

        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(error.details && { details: error.details }),
            },
            correlationId,
        });
        return;
    }

    // Unhandled unexpected exceptions
    logger.error(`[${correlationId}] Unhandled Fatal Error: ${error.message}`, {
        stack: error.stack,
    });

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        },
        correlationId,
    });
};