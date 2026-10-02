import { describe, it, expect } from 'vitest';
import { DomainError, NotFoundError } from './base.error';

describe('Base Errors Unit Tests', () => {
    it('should create DomainError with default status 400', () => {
        const error = new DomainError('Invalid business rule');
        expect(error.message).toBe('Invalid business rule');
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('DOMAIN_ERROR');
    });

    it('should format NotFoundError message correctly', () => {
        const error = new NotFoundError('User', '12345');
        expect(error.message).toBe('User with identifier 12345 was not found.');
        expect(error.statusCode).toBe(404);
    });
});