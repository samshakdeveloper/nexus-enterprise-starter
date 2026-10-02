import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Enterprise Node.js TypeScript API Starter Kit',
            version: '1.0.0',
            description: 'Generic Clean Architecture & DDD REST API Starter Kit',
            contact: {
                name: 'API Development Team',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/v1`,
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token to authorize requests.',
                },
            },
        },
    },
    apis: ['./src/modules/**/*.ts', './src/shared/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);