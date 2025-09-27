// Import function
import { ComparePassword } from '../utils/index.util.js';
import { getUserByUsername } from './index.service.js';
import { GetToken } from '../utils/index.util.js';

// Import type
import type { BaseResponse, UserModel } from '../models/index.model.js';

// Handle process login
async function login({ username, password }: Pick<UserModel, 'username' | 'password'>): Promise<BaseResponse> {
    try {
        if (!username || !password) {
            return {
                success: false,
                message: 'Username or Password must be filled',
                statusCode: 422
            }
        }

        const responseGetUser = await getUserByUsername({ username });

        // If response not success or there is empty data, return validation message
        if (!responseGetUser.success || !responseGetUser ||
            !responseGetUser?.data?.hashed_password || !responseGetUser?.data?.salt) {
            return {
                success: false,
                message: responseGetUser?.message ?? 'Userdata is not completed',
                statusCode: responseGetUser.statusCode,
            }
        }

        // Compare password input and from existing
        const responseComparePassword = await ComparePassword({
            passwordInput: password,
            username,
            hashedPassword: responseGetUser.data.hashed_password,
            salt: responseGetUser.data.salt
        })

        // If response not success, return validation message
        if (!responseComparePassword.success) {
            return {
                success: false,
                message: responseComparePassword?.message ?? 'Password not match',
                statusCode: responseComparePassword.statusCode
            }
        }

        // Declare data that will set in token
        const tokenData = {
            username
        }

        // Get response token
        const responseGetToken = GetToken({ tokenData, timeExpired: '12h' });

        // If token not found, return validation message
        if (!responseGetToken?.success || !responseGetToken?.data) {
            return {
                success: false,
                message: 'Token not found',
                statusCode: 422
            }
        }

        return {
            success: true,
            message: 'Login Success',
            data: responseGetToken.data,
            statusCode: 200
        }
    } catch (error) {
        console.log(`Error in login`, error);

        return {
            success: false,
            message: 'Error when login',
            statusCode: 500
        }
    }
}

export {
    login
}