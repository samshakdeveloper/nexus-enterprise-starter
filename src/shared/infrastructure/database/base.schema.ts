import { SchemaOptions } from 'mongoose';

export interface IBaseDocument {
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
    deletedAt?: Date | null;
}

export const baseSchemaOptions: SchemaOptions = {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret: Record<string, unknown>) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
};