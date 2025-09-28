import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ParameterModel extends Document {
    file_type: 'pdf' | 'txt' | 'docx'
    file_name: string
    job_description: string
    study_case: string
    status: 'active' | 'deleted'
    createdAt: Date
    updatedAt: Date
}

const parameterSchema = new Schema<ParameterModel>(
    {
        file_name: String,
        job_description: String,
        study_case: String,
        file_type: {
            type: String,
            enum: ['pdf', 'txt', 'docx'],
            default: 'pdf'
        },
        status: {
            type: String,
            enum: ['active', 'deleted'],
            default: 'active'
        }
    }, { timestamps: true }
);

const Parameter: Model<ParameterModel> = mongoose.model<ParameterModel>('parameters', parameterSchema);

export default Parameter;
