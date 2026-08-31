import { UniqueEntityId } from './unique-entity-id';

export abstract class Entity<TProps> {
    protected readonly _id: UniqueEntityId;
    protected props: TProps;

    protected constructor(
        props: TProps,
        id?: UniqueEntityId,
    ) {
        this._id = id ?? new UniqueEntityId();
        this.props = props;
    }

    public get id(): UniqueEntityId {
        return this._id;
    }

    public equals(object?: Entity<TProps>): boolean {
        if (!object) {
            return false;
        }

        return this._id.equals(object._id);
    }
}