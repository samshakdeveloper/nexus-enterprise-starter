import jwt from 'jsonwebtoken';
import { env } from '@config/env.config';

export interface TokenPayload {
    userId: string;
    email: string;
}

export class JwtService {
    static generateToken(payload: TokenPayload): string {
        const options: jwt.SignOptions = env.JWT_EXPIRES_IN
            ? { expiresIn: env.JWT_EXPIRES_IN as NonNullable<jwt.SignOptions['expiresIn']> }
            : {};

        return jwt.sign(payload, env.JWT_SECRET, options);
    }

    static verifyToken(token: string): TokenPayload {
        return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    }
}