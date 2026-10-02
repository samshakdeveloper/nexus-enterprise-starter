import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

    // Database Configurations
    MONGODB_URI: z.string().url({ message: 'MONGODB_URI must be a valid connection string' }),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),

    // Service Keys
    OPENAI_API_KEY: z.string().min(1, { message: 'OPENAI_API_KEY is required' }),
    TELEGRAM_BOT_TOKEN: z.string().min(1, { message: 'TELEGRAM_BOT_TOKEN is required' }),
    ETH_RPC_URL: z.string().url({ message: 'ETH_RPC_URL must be a valid RPC URL' }),

    // JWT Configurations
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
    JWT_EXPIRES_IN: z.string().default('1d'),
});

export interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug';
    MONGODB_URI: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    OPENAI_API_KEY: string;
    TELEGRAM_BOT_TOKEN: string;
    ETH_RPC_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
}

const parseEnv = (): EnvConfig => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        // eslint-disable-next-line no-console
        console.error('❌ Environment Variable Validation Error:', JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }

    return result.data as EnvConfig;
};

export const env: EnvConfig = parseEnv();