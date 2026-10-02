import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase, UserAlreadyExistsError } from './create-user.use-case';
import { IUserRepository } from '../../domain/user.repository.interface';
import { User } from '../../domain/user.entity';

class InMemoryUserRepository implements IUserRepository {
    private users: Map<string, User> = new Map();

    async save(user: User): Promise<void> {
        this.users.set(user.id, user);
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email.value === email) {
                return user;
            }
        }
        return null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }
}

describe('CreateUserUseCase', () => {
    let repository: InMemoryUserRepository;
    let useCase: CreateUserUseCase;

    beforeEach(() => {
        repository = new InMemoryUserRepository();
        useCase = new CreateUserUseCase(repository);
    });

    it('should create and save a new user successfully', async () => {
        const dto = { email: 'john@example.com', password: 'securePassword123' };
        const result = await useCase.execute(dto);

        expect(result.isOk).toBe(true);
        if (result.isOk) {
            expect(result.value.email.value).toBe('john@example.com');
            const savedUser = await repository.findByEmail('john@example.com');
            expect(savedUser).not.toBeNull();
        }
    });

    it('should return error if user with same email exists', async () => {
        const dto = { email: 'john@example.com', password: 'securePassword123' };
        await useCase.execute(dto);

        const result = await useCase.execute(dto);
        expect(result.isErr).toBe(true);
        if (result.isErr) {
            expect(result.error).toBeInstanceOf(UserAlreadyExistsError);
        }
    });
});