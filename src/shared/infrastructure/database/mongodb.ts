import mongoose, { Connection } from 'mongoose';
import { env } from '@config/env.config';
import { logger } from '@shared/infrastructure/logger';
import { InfrastructureError } from '@shared/core/errors/base.error';

export class MongoDatabase {
    private static instance: MongoDatabase;
    private connection: Connection | null = null;

    private constructor() {}

    public static getInstance(): MongoDatabase {
        if (!MongoDatabase.instance) {
            MongoDatabase.instance = new MongoDatabase();
        }
        return MongoDatabase.instance;
    }

    public async connect(): Promise<Connection> {
        if (this.connection && this.connection.readyState === 1) {
            return this.connection;
        }

        try {
            const conn = await mongoose.connect(env.MONGODB_URI);
            this.connection = conn.connection;
            logger.info('🍃 MongoDB connected successfully');
            return this.connection;
        } catch (error) {
            logger.error('❌ Failed to connect to MongoDB:', error);
            throw new InfrastructureError(
                'Database connection failure',
                'DATABASE_CONNECTION_ERROR',
                { error: error instanceof Error ? error.message : String(error) }
            );
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
            logger.info('🍃 MongoDB disconnected successfully');
        }
    }

    public getConnection(): Connection | null {
        return this.connection;
    }
}