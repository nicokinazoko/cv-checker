import { login } from './login.service.js';
import {
    getAllUsers,
    createUser,
    getUserByUsername,
    getUserById,
    updateUser,
    deleteUser
} from './user.service.js';

import {
    createParameter
} from './parameter.service.js';

import {
    processCv,
    getOneProcess
} from './processes.service.js';

export {
    // Users
    getAllUsers,
    getUserByUsername,
    getUserById,
    createUser,
    updateUser,
    deleteUser,

    // Login
    login,

    // Parameter,
    createParameter,

    // Process
    processCv,
    getOneProcess
}