import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// For start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

// Define base route
app.get('/', (req, res) => {
    return res.send('Cover Checker');
})

// Start server
startServer();