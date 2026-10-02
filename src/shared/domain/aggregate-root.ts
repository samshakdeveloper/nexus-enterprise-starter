import { randomUUID } from 'node:crypto';

/**
 * Base class for all Aggregate Roots in the Domain Layer.
 * Enforces entity boundary and guarantees identifier consistency.
 */
export abstract class AggregateRoot<T> {
    protected readonly props: T;
    private readonly _id: string;

    protected constructor(props: T, id?: string) {
        this.props = props;
        this._id = id ? id : randomUUID();
    }

    public get id(): string {
        return this._id;
    }
}