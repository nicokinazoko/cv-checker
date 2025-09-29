// Import type from dependencies
import type { Request, Response } from 'express';

import { getOneProcess } from "../services/index.service.js";


async function getOneProcessController(req: Request, res: Response): Promise<void> {
    try {
        // Get id from params
        const { id } = req.params || {};

        // If id not found, return validation message
        if (!id) {
            res.status(422).json({
                success: false,
                message: 'Parameter id must be filled',
            })
            return;
        }

        // Get response
        const responseGetOneProcess = await getOneProcess({ process_id: id });

        // Return response
        if (!responseGetOneProcess.success || !responseGetOneProcess.data) {
            res.status(422).json({
                success: false,
                message: 'Parameter id must be filled',
            })
            return;
        }

        res.status(200).json({
            id: responseGetOneProcess.data.id,
            status: responseGetOneProcess.data.status
        })

        return;
    } catch (error: any) {
        console.error('Error in updateUserController:', error);

        // return error to api
        if (error?.status === 400) {
            res.status(400).json({
                status: 102,
                message: error.message,
                data: null,
            });
        } else {
            // return error to api
            res.status(500).json({
                status: 102,
                message: error?.message,
                data: null,
            });
        }
    }
}

export {
    getOneProcessController
}

