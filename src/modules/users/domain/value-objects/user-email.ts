import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, ok, err } from '../../../../shared/core/result';
import { BaseError } from '../../../../shared/core/errors/base.error';

export interface UserEmailProps {
    value: string;
    [key: string]: unknown;
}

export class InvalidEmailError extends BaseError {
    constructor(email: string) {
        super(`Invalid email format provided: ${email}`);
    }
}

export class UserEmail extends ValueObject<UserEmailProps> {
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    get value(): string {
        return this.props.value;
    }

    public static create(email: string): Result<UserEmail, InvalidEmailError> {
        const trimmed = email.trim().toLowerCase();

        if (!trimmed || !this.EMAIL_REGEX.test(trimmed)) {
            return err(new InvalidEmailError(email));
        }

        return ok(new UserEmail({ value: trimmed }));
    }
}