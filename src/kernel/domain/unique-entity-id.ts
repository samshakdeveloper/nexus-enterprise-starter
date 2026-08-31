import { randomUUID } from 'node:crypto';

export class UniqueEntityId {
    private readonly value: string;

    constructor(id?: string) {
        this.value = id ?? randomUUID();
    }

    public equals(other: UniqueEntityId): boolean {
        return this.value === other.value;
    }

    public toString(): string {
        return this.value;
    }

    public toValue(): string {
        return this.value;
    }
}