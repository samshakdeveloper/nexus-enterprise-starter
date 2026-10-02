import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from './error.middleware';
import { NotFoundError, BaseError } from '@shared/core/errors/base.error';
import { logger } from '@shared/infrastructure/logger';
import { CORRELATION_ID_HEADER } from '../correlation-id.middleware';

vi.mock('@shared/infrastructure/logger', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('Error Middleware Unit Tests', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        mockReq = {
            headers: {
                [CORRELATION_ID_HEADER]: 'test-correlation-id-123',
            },
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        mockNext = vi.fn();
    });

    it('should handle BaseError (operational client errors) with correct status and JSON response', () => {
        const error = new NotFoundError('User', 'usr_123');

        // آرگومان اول error و آرگومان دوم mockReq است
        errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('[test-correlation-id-123] Client Error [NOT_FOUND]'),
            expect.any(Object)
        );
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'User with identifier usr_123 was not found.',
            },
            correlationId: 'test-correlation-id-123',
        });
    });

    it('should handle unhandled unexpected errors with 500 status code', () => {
        const error = new Error('Unexpected database failure');

        errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[test-correlation-id-123] Unhandled Fatal Error'),
            expect.objectContaining({ stack: expect.any(String) })
        );
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    code: 'INTERNAL_SERVER_ERROR',
                }),
                correlationId: 'test-correlation-id-123',
            })
        );
    });

    it('should fallback to N/A correlationId if correlation header is missing', () => {
        const reqWithoutHeader = { headers: {} } as Request;
        const error = new NotFoundError('Resource');

        errorMiddleware(error, reqWithoutHeader, mockRes as Response, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                correlationId: 'N/A',
            })
        );
    });
});