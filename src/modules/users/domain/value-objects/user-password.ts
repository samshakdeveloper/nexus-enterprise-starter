import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, ok, err } from '../../../../shared/core/result';
import { BaseError } from '../../../../shared/core/errors/base.error';

export interface UserPasswordProps {
    value: string;
    [key: string]: unknown;
}

export class InvalidPasswordError extends BaseError {
    constructor(reason: string) {
        super(`Invalid password: ${reason}`);
    }
}

export class UserPassword extends ValueObject<UserPasswordProps> {
    get value(): string {
        return this.props.value;
    }

    public static create(password: string): Result<UserPassword, InvalidPasswordError> {
        if (!password || password.length < 8) {
            return err(new InvalidPasswordError('Password must be at least 8 characters long'));
        }

        return ok(new UserPassword({ value: password }));
    }
}