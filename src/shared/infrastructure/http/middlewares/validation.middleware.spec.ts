
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody } from './validation.middleware';
import { describe, it, expect, vi } from 'vitest';

describe('Validation Middleware', () => {
    // تعریف یک اسکیما نمونه برای تست
    const testSchema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
    });

    it('should call next() and parse body if data is valid', async () => {
        const req = {
            body: { email: 'test@nexus.com', age: 25 },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const middleware = validateBody(testSchema);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(req.body).toEqual({ email: 'test@nexus.com', age: 25 });
    });

    it('should return 400 with details if data is invalid', async () => {
        const req = {
            body: { email: 'invalid-email', age: 15 },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const middleware = validateBody(testSchema);
        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: 'Validation failed',
                details: expect.any(Array),
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should pass non-zod errors to next middleware', async () => {
        const faultySchema = z.object({
            field: z.string().transform(() => {
                throw new Error('Unexpected database or parsing error');
            }),
        });

        const req = {
            body: { field: 'value' },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        const middleware = validateBody(faultySchema);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});