import { randomUUID } from 'node:crypto';

export class UniqueEntityId {
    private readonly value: string;

    constructor(id?: string) {
        this.value = id ?? randomUUID();
    }

    public equals(id?: UniqueEntityId): boolean {
        if (!id) {
            return false;
        }

        return this.value === id.value;
    }

    public toString(): string {
        return this.value;
    }

    public toValue(): string {
        return this.value;
    }
}