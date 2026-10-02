import { describe, it, expect } from 'vitest';
import { User } from './user.entity';
import { UserEmail } from './value-objects/user-email';
import { UserPassword } from './value-objects/user-password';

describe('User Domain Entity Unit Tests', () => {
    it('should create a valid user domain entity', () => {
        const emailResult = UserEmail.create('test@example.com');
        const passwordResult = UserPassword.create('Password123');

        expect(emailResult.isOk).toBe(true);
        expect(passwordResult.isOk).toBe(true);

        if (emailResult.isOk && passwordResult.isOk) {
            const user = User.create({
                email: emailResult.value,
                password: passwordResult.value,
                fullName: 'John Doe',
                role: 'user',
            });

            expect(user.email.value).toBe('test@example.com');
            expect(user.fullName).toBe('John Doe');
            expect(user.role).toBe('user');
            expect(user.isActive).toBe(true);
            expect(user.id).toBeDefined();
        }
    });

    it('should respect custom status and role configurations', () => {
        const email = UserEmail.create('admin@example.com').unwrap();
        const password = UserPassword.create('AdminPass123').unwrap();

        const user = User.create({
            email,
            password,
            role: 'admin',
            isActive: false,
        });

        expect(user.role).toBe('admin');
        expect(user.isActive).toBe(false);
    });
});