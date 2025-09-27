// Import type from dependencies
import type { Request, Response } from 'express';

// Import function
import { login } from '../services/index.service.js';

// Mutation

// To handle login
async function loginController(req: Request, res: Response): Promise<void> {
    try {
        // Get user and password from input
        const { username, password } = req.body || {};

        // If username or password not found, return validation message
        if (!username || !password) {
            res.status(422).json({
                success: false,
                message: 'Username or password must be filled',
                statusCode: 422
            });
            return;
        }
        
        // Get response
        const resultLogin = await login({ username, password });

        // Return response
        res.status(resultLogin.statusCode).json(resultLogin);
        return;
    } catch (error: any) {
        console.error('Error in createUserController:', error);

        // return error to api
        if (error?.status === 400) {
            res.status(400).json({
                status: 102,
                message: error.message,
                data: null,
            });
        } else {
            // return error to api
            res.status(500).json({
                status: 102,
                message: error?.message,
                data: null,
            });
        }
    }
}

export {
    loginController
}