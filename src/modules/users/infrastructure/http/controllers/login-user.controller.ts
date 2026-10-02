import { Request, Response, NextFunction } from 'express';
import { AuthenticateUser } from '@modules/users/application/use-cases/authenticate-user';

export class LoginUserController {
    constructor(private readonly authenticateUserUseCase: AuthenticateUser) {}

    /**
     * @openapi
     * /auth/login:
     *   post:
     *     tags:
     *       - Authentication
     *     summary: Authenticate user and return JWT token
     *     description: Authenticates user credentials and returns a JWT access token.
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
     *                 example: user@nexus.com
     *               password:
     *                 type: string
     *                 format: password
     *                 example: Password123
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     email:
     *                       type: string
     *       401:
     *         description: Invalid email or password
     */
    public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await this.authenticateUserUseCase.execute({ email, password });

            if (result.isErr) {
                res.status(result.error.statusCode || 400).json({
                    success: false,
                    error: result.error.message,
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: result.value,
            });
        } catch (error) {
            next(error);
        }
    }
}