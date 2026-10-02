import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case';

export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase
    ) {}

    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.createUserUseCase.execute({ email, password });

            if (result.isErr) {
                res.status(400).json({
                    success: false,
                    error: result.error.message,
                });
                return;
            }

            const user = result.value;
            res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email.value,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}