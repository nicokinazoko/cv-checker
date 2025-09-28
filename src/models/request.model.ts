import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import type { ProcessModel } from './processes.model.js';

export interface RequestModel extends Document {
    process_id: Types.ObjectId | ProcessModel
    token_used: Number
    createdAt: Date
    updatedAt: Date
}

const requestSchema = new Schema<RequestModel>({
    process_id: {
        type: Types.ObjectId,
        ref: 'processes'
    },
    token_used: Number,
}, { timestamps: true });

const Request: Model<RequestModel> = mongoose.model<RequestModel>('requests', requestSchema);

export default Request;

