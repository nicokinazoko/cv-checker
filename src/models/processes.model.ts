import mongoose, { Document, Model, Schema, Types } from 'mongoose';

import type { ResultModel } from './result.model.js';
import type { UserModel } from './index.model.js';
import type { ParameterModel } from './index.model.js';

export interface ProcessModel extends Document {
    status_process: 'success' | 'processing' | 'failed' | 'queued' | 'canceled' | 'pending'
    result_id: Types.ObjectId | ResultModel,
    user_id: Types.ObjectId | UserModel,
    parameter_id: Types.ObjectId | ParameterModel
    status: 'active' | 'deleted'
    failure_reason: string
    createdAt: Date
    updatedAt: Date
}

const processSchema = new Schema<ProcessModel>({
    status_process: {
        type: String,
        enum: ['success', 'processing', 'failed', 'queued', 'canceled', 'pending'],
        default: 'pending'
    },
    result_id: {
        type: Types.ObjectId,
        ref: 'results'
    },
    user_id: {
        type: Types.ObjectId,
        ref: 'users'
    },
    parameter_id: {
        type: Types.ObjectId,
        ref: 'parameters'
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    failure_reason: String
}, {
    timestamps: true
});

const Process: Model<ProcessModel> = mongoose.model<ProcessModel>('processes', processSchema);

export default Process;