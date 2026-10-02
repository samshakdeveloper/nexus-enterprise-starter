import { z } from 'zod';

export const registerUserSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .toLowerCase(),
    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters long'),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;