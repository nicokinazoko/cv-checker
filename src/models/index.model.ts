import User from './user.model.js';
import Parameter from './parameter.model.js';
import Result from './result.model.js';
import Process from './processes.model.js';
import Request from './request.model.js';

import type { UserModel } from './user.model.js';
import type { ParameterModel } from './parameter.model.js';
import type { ResultModel } from './result.model.js';
import type { ProcessModel } from './processes.model.js';
import type { RequestModel } from './request.model.js';

import type { Request as RequestParameter } from 'express';

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

// Import type 
interface CreateParameterParams
    extends Pick<ParameterModel, 'file_name' | 'file_type' | 'job_description' | 'study_case'> {
    username: string
}

interface RequestWithUsername extends RequestParameter {
    username: string
}

// Export Model
export {
    User,
    Parameter,
    Result,
    Process,
    Request,
}

// Export type
export type {
    // Model interface
    UserModel,
    ParameterModel,
    ProcessModel,
    RequestModel,
    ResultModel,
    CreateParameterParams,


    // Interface
    BaseResponse,
    QueryGetUser,
    TokenData,
    ExpiresInString,
    RequestWithUsername,
};