import { IUserRepository } from '@modules/users/domain/user.repository.interface';
import { User } from '@modules/users/domain/user.entity';
import { UserEmail } from '@modules/users/domain/value-objects/user-email';
import { UserPassword } from '@modules/users/domain/value-objects/user-password';
import { Result, ok, err } from '@shared/core/result';
import { BaseError } from '@shared/core/errors/base.error';
import { PasswordHasher } from '@shared/infrastructure/security/password-hasher';

export interface CreateUserDTO {
    email: string;
    password: string;
}

export class UserAlreadyExistsError extends BaseError {
    constructor(email: string) {
        super(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS', 400);
        this.name = 'UserAlreadyExistsError';
    }
}

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    public async execute(dto: CreateUserDTO): Promise<Result<User, BaseError>> {
        const emailResult = UserEmail.create(dto.email);
        if (emailResult.isErr) {
            return err(emailResult.error);
        }

        // ۱. اول پسورد خام کاربر رو با قوانین دامنه اعتبارسنجی کن
        const rawPasswordResult = UserPassword.create(dto.password);
        if (rawPasswordResult.isErr) {
            return err(rawPasswordResult.error);
        }

        const email = emailResult.value;

        const existingUser = await this.userRepository.findByEmail(email.value);
        if (existingUser) {
            return err(new UserAlreadyExistsError(email.value));
        }

        // ۲. فقط بعد از عبور از اعتبارسنجی، هش کن
        const hashedPassword = await PasswordHasher.hash(rawPasswordResult.value.value);
        const passwordResult = UserPassword.create(hashedPassword);
        if (passwordResult.isErr) {
            // این خطا در عمل رخ نمی‌ده چون هش همیشه طولانی‌تر از حداقل است،
            // ولی برای type-safety نگهش می‌داریم
            return err(passwordResult.error);
        }

        const user = User.create({ email, password: passwordResult.value });
        await this.userRepository.save(user);

        return ok(user);
    }
}