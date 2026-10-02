import { Collection, Document } from 'mongodb';
import { IUserRepository } from '@modules/users/domain/user.repository.interface';
import { User } from '@modules/users/domain/user.entity';
import { UserEmail } from '@modules/users/domain/value-objects/user-email';
import { UserPassword } from '@modules/users/domain/value-objects/user-password';
import { MongoDatabase } from '@shared/infrastructure/database/mongodb';

interface UserDocument extends Document {
    _id: string;
    email: string;
    password: string;
    createdAt: Date;
}

/**
 * MongoDB implementation of the IUserRepository interface.
 * Handles persistence and reconstitution of User domain entities.
 */
export class MongoUserRepository implements IUserRepository {
    private get collection(): Collection<UserDocument> {
        const connection = MongoDatabase.getInstance().getConnection();
        if (!connection || !connection.db) {
            throw new Error('Database connection is not active.');
        }
        return connection.db.collection<UserDocument>('users');
    }

    public async save(user: User): Promise<void> {
        await this.collection.updateOne(
            { _id: user.id },
            {
                $set: {
                    email: user.email.value,
                    password: user.password.value,
                    createdAt: user.createdAt,
                },
            },
            { upsert: true }
        );
    }

    public async findByEmail(email: string): Promise<User | null> {
        const doc = await this.collection.findOne({ email: email.toLowerCase() });
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    public async findById(id: string): Promise<User | null> {
        const doc = await this.collection.findOne({ _id: id });
        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    private toDomain(doc: UserDocument): User {
        const emailResult = UserEmail.create(doc.email);
        const passwordResult = UserPassword.create(doc.password);

        if (emailResult.isErr || passwordResult.isErr) {
            throw new Error(`Corrupted user domain data in database for ID: ${doc._id}`);
        }

        return User.create(
            {
                email: emailResult.value,
                password: passwordResult.value,
                createdAt: doc.createdAt,
            },
            doc._id
        );
    }
}