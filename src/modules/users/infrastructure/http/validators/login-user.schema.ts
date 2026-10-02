import { z } from 'zod';

export const loginUserSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password cannot be empty'),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;