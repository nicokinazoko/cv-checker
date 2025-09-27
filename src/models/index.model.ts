import User from './user.model.js';
import type { UserModel } from './user.model.js';

export {
    User
}

// Define interface for response
interface BaseResponse<T = any> {
    success: boolean
    message?: string
    data?: T
    statusCode: number
    totalData?: number
}


// Define interface for query user
interface QueryGetUser {
    page: number
    limit: number
    userId: string
    username: string
}

// Define interface for token data
interface TokenData {
    username: string
}

// Define type for parameter expired in jwt
type ExpiresInString = `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;


export type {
    // Model interface
    UserModel,

    // Interface
    BaseResponse,
    QueryGetUser,
    TokenData,
    ExpiresInString
};