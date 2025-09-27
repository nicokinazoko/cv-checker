import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface UserModel extends Document {
    id: string
    username: string
    hashed_password: string
    password: string
    status: 'active' | 'deleted'
    salt: string
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<UserModel>(
    {
        username: { type: String, required: true },
        hashed_password: { type: String, required: true },
        salt: { type: String, required: true },
        status: {
            type: String,
            enum: ['active', 'deleted'],
            default: 'active'
        }
    }, { timestamps: true }
);

const User: Model<UserModel> = mongoose.model<UserModel>('users', userSchema);

export default User;
