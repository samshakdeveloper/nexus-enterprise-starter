import { User } from './user.entity';

/**
 * Domain Repository Interface for User Aggregate.
 * Defines contract for data persistence abstraction (DIP).
 */
export interface IUserRepository {
    save(user: User): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}