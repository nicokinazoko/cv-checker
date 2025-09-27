// Import model
import { User } from '../models/index.model.js';

// Import type
import type { BaseResponse, UserModel } from '../models/index.model.js';

// To check usernmae already exist or not
async function checkUsernameExist({ username }: Pick<UserModel, 'username'>): Promise<BaseResponse> {
    try {
        if (!username) {
            return {
                success: false,
                message: 'Parameter username must be filled',
                statusCode: 422
            }
        }

        // Find username in user
        const existingUser = await User.findOne({
            username
        }).lean();

        if (existingUser) {
            return {
                success: false,
                message: 'Username already exist',
                statusCode: 409
            }
        }


        return {
            success: true,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: 'Error when check same username',
            statusCode: 500
        }
    }
}

export {
    checkUsernameExist
}