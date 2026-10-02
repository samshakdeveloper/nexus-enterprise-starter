import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { UserController } from './user.controller';
import { ok, err } from '@shared/core/result';
import { BaseError } from '@shared/core/errors/base.error';

describe('UserController Unit Tests', () => {
    let controller: UserController;
    let mockCreateUserUseCase: { execute: ReturnType<typeof vi.fn> };
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockCreateUserUseCase = { execute: vi.fn() };
        controller = new UserController(mockCreateUserUseCase as any);

        mockReq = { body: {} };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        mockNext = vi.fn();
    });

    it('should return 201 when registration succeeds', async () => {
        mockReq.body = { email: 'test@example.com', password: 'Password123' };
        mockCreateUserUseCase.execute.mockResolvedValue(
            ok({
                id: 'usr_1',
                email: { value: 'test@example.com' },
                createdAt: new Date(),
            })
        );

        await controller.register(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
            })
        );
    });

    it('should return 400 when registration fails', async () => {
        mockReq.body = { email: 'invalid', password: '123' };
        mockCreateUserUseCase.execute.mockResolvedValue(err(new BaseError('Invalid input')));

        await controller.register(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Invalid input',
        });
    });

    it('should pass error to next function if use case throws', async () => {
        mockReq.body = { email: 'test@example.com', password: 'Password123' };
        const unhandledError = new Error('Database down');
        mockCreateUserUseCase.execute.mockRejectedValue(unhandledError);

        await controller.register(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(unhandledError);
    });
});