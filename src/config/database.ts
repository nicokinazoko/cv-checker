import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Get URL mongodb via env
const MONGODB_URI = process.env.MONGODB_URI;

// If mongodb URL not exist, return error
if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined');
}

export const connectDB = async () => {
    try {
        // Connect mongodb
        await mongoose.connect(MONGODB_URI);

        console.log('Database connected');
    } catch (error) {
        console.error('Connection error:', error);

        // Return error
        process.exit(1);
    }
};