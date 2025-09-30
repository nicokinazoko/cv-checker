import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import type { BaseResponse, TokenData, ExpiresInString } from '../models/index.model.js';

const secretKey = process.env.JWT_SECRET_KEY || '';

type TokenResponse = {
  token: string;
  user: {
    username: string;
  };
};
async function ComparePassword({ passwordInput, username, hashedPassword, salt }: Record<string, string>): Promise<BaseResponse> {
    try {
        if (!passwordInput || !username || !hashedPassword || !salt) {
            return {
                success: false,
                statusCode: 422,
                message: 'Parameter(s) are missing'
            }
        }

        const resultCompare = await bcrypt.compare(passwordInput + salt, hashedPassword);

        return {
            success: resultCompare,
            message: resultCompare ? 'Password match' : 'Password is not match',
            statusCode: resultCompare ? 200 : 401
        }
    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: 'Error when compare password',
            statusCode: 500
        }
    }
}

// function GetToken({ tokenData, timeExpired }: { tokenData: TokenData; timeExpired: ExpiresInString | number }): BaseResponse<Object> {
function GetToken({ tokenData, timeExpired }: { tokenData: TokenData; timeExpired: ExpiresInString | number }): BaseResponse<TokenResponse> {
    try {
        if (!tokenData || !timeExpired || !secretKey) {
            return {
                success: false,
                message: 'Parameter not exist',
                statusCode: 422
            }
        }

        const token = jwt.sign(tokenData, secretKey, { expiresIn: timeExpired });

        return {
            success: true,
            data: {
                token,
                user: {
                    username: tokenData.username
                }
            },
            statusCode: 200
        };
    } catch (error) {
        console.log('Error in get token: ', error);

        return {
            success: false,
            message: 'Error when login',
            statusCode: 500
        }
    }
}

export {
    ComparePassword,
    GetToken,

};
