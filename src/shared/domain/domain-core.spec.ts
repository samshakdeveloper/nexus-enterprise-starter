import { describe, it, expect } from 'vitest';
import { Entity } from './entity';
import { ValueObject } from './value-object';

interface TestEntityProps {
    name: string;
}

class TestEntity extends Entity<TestEntityProps> {}

interface TestValueObjectProps {
    street: string;
    zipCode: string;
}

class TestValueObject extends ValueObject<TestValueObjectProps> {}

describe('Domain Core Abstractions', () => {
    describe('Entity', () => {
        it('should be equal if IDs match regardless of props', () => {
            const id = crypto.randomUUID();
            const entity1 = new TestEntity({ name: 'Alpha' }, id);
            const entity2 = new TestEntity({ name: 'Beta' }, id);

            expect(entity1.equals(entity2)).toBe(true);
        });

        it('should not be equal if IDs differ', () => {
            const entity1 = new TestEntity({ name: 'Alpha' });
            const entity2 = new TestEntity({ name: 'Alpha' });

            expect(entity1.equals(entity2)).toBe(false);
        });
    });

    describe('ValueObject', () => {
        it('should be equal if props are structurally identical', () => {
            const vo1 = new TestValueObject({ street: 'Main St', zipCode: '12345' });
            const vo2 = new TestValueObject({ street: 'Main St', zipCode: '12345' });

            expect(vo1.equals(vo2)).toBe(true);
        });

        it('should freeze props preventing mutations', () => {
            const vo = new TestValueObject({ street: 'Main St', zipCode: '12345' });

            expect(() => {
                // @ts-expect-error Testing immutability runtime behavior
                vo.props.street = 'New St';
            }).toThrow();
        });
    });
});