import { createLogger, format, transports } from 'winston';
import { env } from '@config/env.config';

export const logger = createLogger({
    level: env.LOG_LEVEL,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    defaultMeta: { service: 'nexus-ai-web3-hub' },
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, service, stack }) => {
                    const logOutput = `[${timestamp as string}] [${level}] [${service as string}]: ${message as string}`;
                    return stack ? `${logOutput}\n${stack as string}` : logOutput;
                }),
            ),
        }),
    ],
});