import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    emailVerified: boolean;
    paperBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image: { type: String },
        emailVerified: { type: Boolean, default: false },
        paperBalance: { type: Number, default: 100000 },
    },
    { timestamps: true, collection: 'user' } // Explicitly map to 'user' collection used by better-auth
);

export const User: Model<IUser> = (models?.User as Model<IUser>) || model<IUser>('User', UserSchema);
