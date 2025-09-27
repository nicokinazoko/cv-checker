import express from 'express';
import {
    createUserController,
    getAllUsersController,
    getOneUserByIdController,
    updateUserController,
    deleteUserController
} from '../controllers/index.controller.js';

import {
    VerifyJWTToken
} from '../middlewares/index.middleware.js';

const router = express.Router();

// TODO: ADD LIMITER FOR ALL ROUTES

// For create user
router.post('/create', createUserController);

// For get all user
router.get('/', VerifyJWTToken, getAllUsersController);

// For get user by id
router.get('/:id', getOneUserByIdController);

// To edit user by id
router.patch('/edit/:id', VerifyJWTToken, updateUserController);

// To delete user by id
router.delete('/:id', VerifyJWTToken, deleteUserController);

export default router;
