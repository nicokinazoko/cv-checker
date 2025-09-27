// Import model
import { User } from '../models/index.model.js';

// Import type
import type { UserModel, QueryGetUser, BaseResponse } from '../models/index.model.js';

// Import function 
import { createSalt, generateHashedPassword, ComparePassword } from '../utils/index.util.js';
import { checkUsernameExist } from '../utils/user.util.js';

// To get all user with pagination
async function getAllUsers({ page = 0, limit = 10 }: Pick<QueryGetUser, 'page' | 'limit'>): Promise<BaseResponse<UserModel[]>> {
    try {
        // Generate result with data and total data
        const result = await User.aggregate([
            { $match: { status: 'active' } },
            {
                $facet: {
                    data: [
                        { $skip: page * limit },
                        { $limit: limit },
                        { $project: { username: 1, status: 1 } }
                    ],
                    total: [{ $count: "count" }]
                }
            }
        ]);

        // Define result all users
        const users = result[0].data;

        // Define total users
        const totalUsers = result[0].total[0]?.count || 0;

        return {
            success: true,
            statusCode: 200,
            data: users,
            totalData: totalUsers
        }
    } catch (error) {
        return {
            success: false,
            message: 'Error when get all users',
            statusCode: 500
        }
    }
}

// To handle get user by id
async function getUserById({ userId }: Pick<QueryGetUser, 'userId'>): Promise<BaseResponse<UserModel>> {
    try {
        // If user id not found, return validation message
        if (!userId) {
            return {
                success: false,
                message: 'user id is required',
                statusCode: 422
            }
        }

        // Find user with id and status active
        const user = await User.findOne({
            _id: userId,
            status: 'active'
        }).select('username status').lean();

        // If user not found, return validation message
        if (!user) {
            return {
                success: false,
                message: 'user not found',
                statusCode: 422
            }
        }

        return {
            success: true,
            data: user,
            statusCode: 200
        }

    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: 'There is error when get one users',
            statusCode: 500
        }
    }
}

// To get user by username
async function getUserByUsername({ username }: Pick<QueryGetUser, 'username'>): Promise<BaseResponse<UserModel>> {
    try {
        // If username not found, return validation message
        if (!username) {
            return {
                success: false,
                message: 'username is required',
                statusCode: 422
            }
        }

        // Get user by username and status active
        const currentUser = await User.findOne({ username, status: 'active' }).
            select('username hashed_password salt')
            .lean();

            // If user not exist, return validation message
        if (!currentUser) {
            return {
                success: false,
                message: 'User not found',
                statusCode: 422
            }
        }

        return {
            success: true,
            data: currentUser,
            statusCode: 200
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Error when get user by username',
            statusCode: 500
        }
    }
}

// To handle create user functionality
async function createUser({ username, password }: Pick<UserModel, 'username' | 'password'>): Promise<BaseResponse> {
    try {
        // If parameter not found, return validation message
        if (!username || !password) {
            return {
                success: false,
                message: 'Username or password must be filled',
                statusCode: 422
            }
        }

        // Check if username already exist
        const response = await checkUsernameExist({ username });

        if (!response?.success) {
            return response;
        }

        // generate salt for password
        const salt = await createSalt();

        // generate hashed password using salt
        const hashedPassword = await generateHashedPassword(password, salt);

        // Create new user
        const createdUser = await User.create({
            username,
            hashed_password: hashedPassword,
            salt
        });

        return {
            success: true,
            message: 'User created',
            data: {
                _id: createdUser._id,
                username: createdUser.username
            },
            statusCode: 200
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Error when create user',
            statusCode: 500
        }
    }
}

// To handle process update user
async function updateUser({ id, password }: Pick<UserModel, 'id' | 'password'>): Promise<BaseResponse> {
    try {
        // If parameter not found, return validation message
        if (!password) {
            return {
                success: false,
                message: 'Parameter password must be filled',
                statusCode: 422
            }
        }

        // Find user already exist
        const existingUser = await User.findById(id).lean();

        if (!existingUser) {
            return {
                success: false,
                message: 'User not exist',
                statusCode: 422
            }
        }

        // Get response compare password
        const responseComparePassword = await ComparePassword({
            passwordInput: password,
            username: existingUser?.username,
            hashedPassword: existingUser?.hashed_password,
            salt: existingUser?.salt
        });

        // If password same with existing, return validation message
        if (responseComparePassword.success) {
            return {
                success: false,
                message: 'Password must not be same with current password',
                statusCode: 422
            }

        }

        // generate salt for password
        const salt = await createSalt();

        // generate hashed password using salt
        const hashedPassword = await generateHashedPassword(password, salt);

        // Update password for user
        await User.findByIdAndUpdate(id, {
            hashed_password: hashedPassword,
            salt
        });

        return {
            success: true,
            statusCode: 200
        }
    } catch (error) {
        return {
            success: false,
            message: 'Error when update data',
            statusCode: 500
        }
    }
}

// To handle functionality delete user
async function deleteUser({ id }: Pick<UserModel, 'id'>): Promise<BaseResponse> {
    try {
        if (!id) {
            return {
                success: false,
                message: 'Parameter id is missing',
                statusCode: 422
            }
        }

        // Find user already exist
        const existingUser = await User.findOne({ _id: id, status: 'active' }).lean();

        // IF user not exist, then return validation message
        if (!existingUser) {
            return {
                success: false,
                message: 'User not found',
                statusCode: 422
            }
        }

        // Update status user to deleted
        await User.findByIdAndUpdate(id, {
            status: 'deleted'
        })

        return {
            success: true,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: 'Error when update data',
            statusCode: 500
        }
    }
}

export {
    getAllUsers,
    getUserById,
    getUserByUsername,
    
    createUser,
    updateUser,
    deleteUser
}


