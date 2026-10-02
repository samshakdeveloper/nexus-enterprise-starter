import { Entity } from '@shared/domain/entity';
import { UserEmail } from './value-objects/user-email';
import { UserPassword } from './value-objects/user-password';

export interface UserProps {
    email: UserEmail;
    password: UserPassword;
    fullName?: string | undefined;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date | undefined;
}

export interface CreateUserProps {
    email: UserEmail;
    password: UserPassword;
    fullName?: string | undefined;
    role?: 'user' | 'admin' | undefined;
    isActive?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

/**
 * Domain Entity representing a User in the system boundary.
 * Enforces business constraints and immutable identification.
 */
export class User extends Entity<UserProps> {
    get email(): UserEmail {
        return this.props.email;
    }

    get password(): UserPassword {
        return this.props.password;
    }

    get fullName(): string | undefined {
        return this.props.fullName;
    }

    get role(): 'user' | 'admin' {
        return this.props.role;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    public static create(props: CreateUserProps, id?: string): User {
        const now = new Date();

        return new User(
            {
                email: props.email,
                password: props.password,
                fullName: props.fullName,
                role: props.role ? props.role : 'user',
                isActive: props.isActive !== undefined ? props.isActive : true,
                createdAt: props.createdAt ? props.createdAt : now,
                updatedAt: props.updatedAt ? props.updatedAt : now,
            },
            id
        );
    }
}