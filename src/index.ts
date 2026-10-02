import 'module-alias/register';
import { env } from '@config/env.config';
import { logger } from '@shared/infrastructure/logger';
import { MongoDatabase } from '@shared/infrastructure/database/mongodb';
import { app } from './app';

async function bootstrap(): Promise<void> {
    try {
        logger.info('🚀 Initializing Nexus Enterprise AI & Web3 Hub...');
        logger.info(`⚙️  Environment: ${env.NODE_ENV}`);
        logger.info(`🔌 Port Configured: ${env.PORT}`);

        // 1. Initialize Infrastructure Connections
        const db = MongoDatabase.getInstance();
        await db.connect();

        // 2. Start HTTP Server Listener
        const server = app.listen(env.PORT, () => {
            logger.info(`🌐 HTTP Server successfully running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        });

        // 3. Global Unhandled Crash Guards
        process.on('uncaughtException', (error: Error) => {
            logger.error('💥 Uncaught Exception detected:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason: unknown) => {
            logger.error('💥 Unhandled Rejection detected:', reason instanceof Error ? reason : new Error(String(reason)));
            process.exit(1);
        });

        // 4. Enterprise Graceful Shutdown Protocol
        const shutdown = async (signal: string): Promise<void> => {
            logger.warn(`⚠️  Received ${signal}. Initiating graceful shutdown sequence...`);

            server.close(async () => {
                logger.info('🚪 HTTP server closed to new requests.');
                try {
                    await db.disconnect();
                    logger.info('👋 Database connection safely closed.');
                    process.exit(0);
                } catch (err) {
                    logger.error('❌ Error during database teardown:', err);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));

    } catch (error) {
        logger.error('❌ Fatal error during bootstrap phase:', error);
        process.exit(1);
    }
}

void bootstrap();