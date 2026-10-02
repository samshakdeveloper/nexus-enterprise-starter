import { describe, it, expect } from 'vitest';
import { ok, err } from './result';

describe('Result Monad Unit Tests', () => {
    it('should create an Ok result with a valid value', () => {
        const result = ok<string, Error>('Success Data');

        expect(result.isOk).toBe(true);
        expect(result.isErr).toBe(false);
        if (result.isOk) {
            expect(result.value).toBe('Success Data');
            expect(result.unwrap()).toBe('Success Data');
        }
    });

    it('should create an Err result with an error payload', () => {
        const errorPayload = new Error('Domain Failure');
        const result = err<string, Error>(errorPayload);

        expect(result.isOk).toBe(false);
        expect(result.isErr).toBe(true);
        if (result.isErr) {
            expect(result.error).toBe(errorPayload);
            expect(() => result.unwrap()).toThrow('Cannot unwrap an Err value');
        }
    });
});