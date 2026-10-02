export abstract class BaseError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown> | undefined;

    constructor(
        message: string,
        code = 'INTERNAL_SERVER_ERROR',
        statusCode = 500,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class DomainError extends BaseError {
    constructor(message: string, code = 'DOMAIN_ERROR', details?: Record<string, unknown>) {
        super(message, code, 400, details);
    }
}

export class ValidationError extends BaseError {
    constructor(message = 'Validation failed', details?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized access', details?: Record<string, unknown>) {
        super(message, 'UNAUTHORIZED', 401, details);
    }
}

export class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden action', details?: Record<string, unknown>) {
        super(message, 'FORBIDDEN', 403, details);
    }
}

export class NotFoundError extends BaseError {
    constructor(entity: string, identifier?: string) {
        const msg = identifier
            ? `${entity} with identifier ${identifier} was not found.`
            : `${entity} not found.`;
        super(msg, 'NOT_FOUND', 404);
    }
}

export class InfrastructureError extends BaseError {
    constructor(message: string, code = 'INFRASTRUCTURE_ERROR', details?: Record<string, unknown>) {
        super(message, code, 500, details);
    }
}