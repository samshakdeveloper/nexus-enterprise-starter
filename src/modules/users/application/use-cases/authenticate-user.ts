import { IUserRepository } from '@modules/users/domain/user.repository.interface';
import { ok, err, Result } from '@shared/core/result';
import { BaseError } from '@shared/core/errors/base.error';
import { JwtService } from '@shared/infrastructure/security/jwt.service';
import { PasswordHasher } from '@shared/infrastructure/security/password-hasher';

export class InvalidCredentialsError extends BaseError {
    constructor() {
        super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
        this.name = 'InvalidCredentialsError';
    }
}

export class AccountDisabledError extends BaseError {
    constructor() {
        super('This account has been disabled', 'ACCOUNT_DISABLED', 403);
        this.name = 'AccountDisabledError';
    }
}

export interface AuthResponseDto {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

export class AuthenticateUser {
    constructor(private readonly userRepository: IUserRepository) {}

    public async execute(input: { email: string; password: string }): Promise<Result<AuthResponseDto, BaseError>> {
        const user = await this.userRepository.findByEmail(input.email);

        if (!user) {
            return err(new InvalidCredentialsError());
        }

        const isPasswordValid = await PasswordHasher.compare(input.password, user.password.value);

        if (!isPasswordValid) {
            return err(new InvalidCredentialsError());
        }

        // پسورد درسته، ولی باید بعد از تایید پسورد چک بشه نه قبلش
        // (تا کسی نتونه با امتحان کردن ایمیل‌ها بفهمه کدوم اکانت غیرفعاله)
        if (!user.isActive) {
            return err(new AccountDisabledError());
        }

        const token = JwtService.generateToken({
            userId: user.id.toString(),
            email: user.email.value,
        });

        return ok({
            token,
            user: {
                id: user.id.toString(),
                email: user.email.value,
            },
        });
    }
}