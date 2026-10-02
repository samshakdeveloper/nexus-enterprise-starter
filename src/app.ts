import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from '@modules/users/infrastructure/http/routes/auth.routes';
import { userRouter } from '@modules/users/infrastructure/http/routes/user.routes';
import { errorMiddleware } from '@shared/infrastructure/http/middlewares/error.middleware';
import { correlationIdMiddleware } from '@shared/infrastructure/http/correlation-id.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger.config';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

// Global Error Handler Middleware
app.use(errorMiddleware);

export { app };
export default app;