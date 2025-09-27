// Import type from dependecies
import type { Request, Response } from 'express';

// Import function 
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
} from '../services/index.service.js';

// Query

// To get all user
async function getAllUsersController(req: Request, res: Response): Promise<void> {
    try {
        // Get page and limit from body and set default value if not exist
        let { page = 0, limit = 10 } = req.body || {};

        // Parse page and limit to integer
        page = parseInt(page);
        limit = parseInt(limit);

        // Get response
        const responseGetAllUsers = await getAllUsers({ limit, page });

        // Return response
        res.status(responseGetAllUsers.statusCode).json(responseGetAllUsers);

        return;

    } catch (error: any) {
        console.error('Error in getAllUsersController:', error);

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

// Get user by id
async function getOneUserByIdController(req: Request, res: Response): Promise<void> {
    try {
        // Get id from params
        const { id } = req.params || {};

        // If param id not found, return
        if (!id) {
            res.status(422).json({
                success: false,
                message: 'Parameter id must be filled',
            })
            return;
        }

        // Get response
        const responseGetUserById = await getUserById({ userId: id });

        // Return response
        res.status(responseGetUserById.statusCode).json(responseGetUserById);
        return;

    } catch (error: any) {
        console.error('Error in get one user by id:', error);

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

// Mutation

// Create user
async function createUserController(req: Request, res: Response): Promise<void> {
    try {
        // Get username and password and body
        const { username, password } = req.body || {};

        // Get response
        const responseCreateUser = await createUser({ username, password });

        // Return response
        res.status(responseCreateUser.statusCode).json(responseCreateUser)

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

// Update user (for now only update password)
async function updateUserController(req: Request, res: Response): Promise<void> {
    try {
        // Get id from params
        const { id } = req.params || {};

        // If id not found, return validation message
        if (!id) {
            res.status(422).json({
                success: false,
                message: 'Parameter id must be filled',
            })
            return;
        }

        // Get password from body
        const { password } = req.body || {};

        // If password not found, return validation message
        if (!password) {
            res.status(422).json({
                success: false,
                message: 'New password is missing',
            })
            return;
        }

        // Get response
        const responseUpdateUser = await updateUser({ id, password });

        // Return response
        res.status(responseUpdateUser.statusCode).json(responseUpdateUser);

        return
    } catch (error: any) {
        console.error('Error in updateUserController:', error);

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

// To delete user by id
async function deleteUserController(req: Request, res: Response): Promise<void> {
    try {
        // Get id from params
        const { id } = req.params || {};

        // If id not found, return validation message
        if (!id) {
            res.status(422).json({
                success: false,
                message: 'Parameter id must be filled',
            })
            return;
        }

        // Get response
        const responseDeleteUser = await deleteUser({ id });

        // Return response
        res.status(responseDeleteUser.statusCode).json(responseDeleteUser);
        return
    } catch (error: any) {
        console.error('Error in updateUserController:', error);

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
    // Query
    createUserController,
    getAllUsersController,
    getOneUserByIdController,

    // Mutation
    updateUserController,
    deleteUserController,
}