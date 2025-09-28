import jwt, { type JwtPayload } from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY ?? '';

// Import type from dependencies
import type { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    username?: string | JwtPayload
}

async function VerifyJWTToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        // Get authorization from headers
        const { authorization } = req.headers;

        // If authorization not found and not string, return validation message
        if (!authorization || typeof authorization !== 'string') {
            res.status(401).json({
                status: 401,
                message: 'Authorization header missing',
                success: false
            });

            return
        }

        // Get token from split authorization and get the second value
        const token = authorization?.split(' ')[1] ?? '';

        // It token not found, return validation message
        if (!token) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: 'Token missing',
            });
            return
        }

        // verify token
        const decoded = jwt.verify(token, secretKey);

        // set username in request
        req.username = decoded;

        // continue process
        next();
    } catch (error) {
        console.log('Error while verifying ', error);

        // return status 401 if error happened
        res.status(401).json({
            success: false,
            statusCode: 401,
            message: 'Token not valid or expired',
        });
    }
}

export {
    VerifyJWTToken
};
