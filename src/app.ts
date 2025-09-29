
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import express from 'express';
import { connectDB } from './config/database.js';

// Import Route
import { UserRouter, LoginRouter, FileRouter, ParameterRouter, ProcessRouter } from './routes/index.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.use('/user', UserRouter);
app.use('/', [LoginRouter, FileRouter, ProcessRouter]);
app.use('/parameter', ParameterRouter);
// Start server
startServer();