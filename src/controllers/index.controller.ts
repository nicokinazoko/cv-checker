import {
    getAllUsersController,
    getOneUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController
} from "./user.controller.js";

import {
    loginController
} from './login.controller.js'

import {
    createParameterController,
    uploadFileController,
    deleteFileController
} from './parameter.controller.js';

export {
    // User
    getAllUsersController,
    getOneUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,

    // Login
    loginController,

    // Parameter
    createParameterController,
    uploadFileController,
    deleteFileController,
}