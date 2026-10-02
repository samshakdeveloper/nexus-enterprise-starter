import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MongoUserRepository } from './mongo-user.repository';
import { User } from '@modules/users/domain/user.entity';
import { UserEmail } from '@modules/users/domain/value-objects/user-email';
import { UserPassword } from '@modules/users/domain/value-objects/user-password';
import { MongoDatabase } from '@shared/infrastructure/database/mongodb';

// ماک کردن درست Singleton کلاس MongoDatabase
vi.mock('@shared/infrastructure/database/mongodb', () => {
    const mockCollection = {
        updateOne: vi.fn(),
        findOne: vi.fn(),
    };

    const mockDb = {
        collection: vi.fn().mockReturnValue(mockCollection),
    };

    return {
        MongoDatabase: {
            getInstance: vi.fn().mockReturnValue({
                getConnection: () => ({
                    db: mockDb,
                }),
            }),
        },
    };
});

describe('MongoUserRepository', () => {
    let repository: MongoUserRepository;
    let mockCollection: any;

    beforeEach(() => {
        const instance = MongoDatabase.getInstance();
        const connection = instance.getConnection();
        mockCollection = connection?.db.collection('users');

        mockCollection.updateOne.mockReset().mockResolvedValue({});
        mockCollection.findOne.mockReset();

        repository = new MongoUserRepository();
    });

    it('should persist user document via updateOne with upsert', async () => {
        const email = UserEmail.create('john@nexus.com').unwrap();
        const password = UserPassword.create('securePassword123').unwrap();
        const user = User.create({ email, password });

        await repository.save(user);

        expect(mockCollection.updateOne).toHaveBeenCalledWith(
            { _id: user.id },
            {
                $set: {
                    email: 'john@nexus.com',
                    password: 'securePassword123',
                    createdAt: expect.any(Date),
                },
            },
            { upsert: true }
        );
    });

    it('should map mongodb document back to domain User entity', async () => {
        const fakeDoc = {
            _id: 'usr_123',
            email: 'john@nexus.com',
            password: 'securePassword123',
            createdAt: new Date(),
        };

        mockCollection.findOne.mockResolvedValue(fakeDoc);

        const user = await repository.findByEmail('john@nexus.com');

        expect(user).not.toBeNull();
        if (user) {
            expect(user.id).toBe('usr_123');
            expect(user.email.value).toBe('john@nexus.com');
        }
    });
});