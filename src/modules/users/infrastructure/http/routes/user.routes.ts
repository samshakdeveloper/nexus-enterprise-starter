import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '@modules/users/infrastructure/http/controllers/user.controller';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case';
import { MongoUserRepository } from '@modules/users/infrastructure/repositories/mongo-user.repository';
import { validateBody } from '@shared/infrastructure/http/middlewares/validation.middleware';
import { registerUserSchema } from '@modules/users/infrastructure/http/validators/register-user.schema';

const userRouter = Router();

const userRepository = new MongoUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass123456!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
userRouter.post(
    '/register',
    validateBody(registerUserSchema),
    (req: Request, res: Response, next: NextFunction) => userController.register(req, res, next)
);

export { userRouter };