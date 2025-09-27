import mongoose, { Document, Model, Schema } from 'mongoose';

interface resultModel extends Document {
    cv_match_rate: number
    cv_feedback: string
    project_score: number
    project_feedback: string
    overall_summary: string
    status: 'active' | 'deleted'
    createdAt: Date
    updatedAt: Date
}

const resultSchema = new Schema<resultModel>({
    cv_match_rate: Number,
    cv_feedback: String,
    project_score: Number,
    project_feedback: String,
    overall_summary: String,
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Result: Model<resultModel> = mongoose.model<resultModel>('results', resultSchema);

export default Result;