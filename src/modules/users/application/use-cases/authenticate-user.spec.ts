import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticateUser, InvalidCredentialsError ,AccountDisabledError } from './authenticate-user';
import { IUserRepository } from '@modules/users/domain/user.repository.interface';
import { User } from '@modules/users/domain/user.entity';
import { UserEmail } from '@modules/users/domain/value-objects/user-email';
import { PasswordHasher } from '@shared/infrastructure/security/password-hasher';
import { JwtService } from '@shared/infrastructure/security/jwt.service';


describe('AuthenticateUser Use Case', () => {
    let authenticateUser: AuthenticateUser;
    let mockUserRepository: Partial<IUserRepository>;

    const testEmail = 'test@nexus.com';
    const testPassword = 'Password123';
    const mockToken = 'mock_jwt_token_string';

    beforeEach(() => {
        vi.restoreAllMocks(); // ۱. ابتدا پاکسازی ماک‌ها

        mockUserRepository = { // ۲. تعریف ماک ریپازیتوری
            findByEmail: vi.fn(),
        };
        authenticateUser = new AuthenticateUser(mockUserRepository as IUserRepository);

        // ۳. تعریف Spy روی سرویس‌های جانبی
        vi.spyOn(PasswordHasher, 'compare').mockResolvedValue(true);
        vi.spyOn(JwtService, 'generateToken').mockReturnValue(mockToken);
    });

    it('should successfully authenticate a user when valid credentials are provided', async () => {
        // ساخت یک کاربر نمونه دامنه با رعایت الگوی Result دامنه
        const emailOrError = UserEmail.create(testEmail);
        const userOrError = User.create({
            email: emailOrError.value!,
            password: testPassword
        });

        // اگر User.create خودش Result برمی‌گرداند:
        const mockUser = userOrError.isOk ? userOrError.value : userOrError;
        // (اگر User.create مستقیماً انتیتی برمی‌گرداند که همان خط قبلی درست است، اما چک کردن isOk جلوی خطاهای احتمالی دامنه را می‌گیرد)

        // شبیه‌سازی پیدا شدن کاربر در دیتابیس
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(mockUser as any);

        const result = await authenticateUser.execute({
            email: testEmail,
            password: testPassword,
        });

        expect(result.isOk).toBe(true);
        expect(result.value).toEqual({
            token: mockToken,
            user: {
                id: expect.any(String),
                email: testEmail,
            },
        });
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(testEmail);

    });

    it('should fail with InvalidCredentialsError if password comparison fails', async () => {
        const emailOrError = UserEmail.create(testEmail);
        const userOrError = User.create({
            email: emailOrError.value!,
            password: testPassword,
        });

        const mockUser = userOrError.isOk ? userOrError.value : userOrError;

        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(mockUser as any);
        vi.spyOn(PasswordHasher, 'compare').mockResolvedValueOnce(false);

        const result = await authenticateUser.execute({
            email: testEmail,
            password: 'WrongPassword',
        });

        expect(result.isErr).toBe(true);
        expect(result.error).toBeInstanceOf(InvalidCredentialsError);
        expect(result.error.statusCode).toBe(401);
    });
    it('should fail with AccountDisabledError if user is inactive', async () => {
        const emailOrError = UserEmail.create(testEmail);
        const userOrError = User.create({
            email: emailOrError.value!,
            password: testPassword,
            isActive: false,
        });
        const mockUser = userOrError.isOk ? userOrError.value : userOrError;

        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(mockUser as any);

        const result = await authenticateUser.execute({
            email: testEmail,
            password: testPassword,
        });

        expect(result.isErr).toBe(true);
        expect(result.error).toBeInstanceOf(AccountDisabledError);
        expect(result.error.statusCode).toBe(403);
    });
});