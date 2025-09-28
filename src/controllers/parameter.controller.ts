// Import type from dependencies
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import type
import type { ParameterModel, RequestWithUsername } from '../models/index.model.js';

// Import function
import { createParameter } from "../services/parameter.service.js";

// Set directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadFileController(req: Request, res: Response): Promise<void> {
    try {
        const { file } = req;

        if (!file) {
            res.status(422).json({
                success: false,
                message: 'Filetype only support plain text, pdf, and docx'
            });

            return;
        }
        // set valid types for upload file
        const validTypes = [
            'text/plain', // .txt
            'application/pdf', // .pdf
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];

        const { mimetype }: { mimetype: string } = file;

        if (!mimetype || !validTypes.includes(mimetype)) {
            res.status(422).json({
                success: false,
                message: 'Filetype only support plain text, pdf, and docx'
            });

            return;
        }

        // Send response with filename
        res.status(200).json({
            success: true,
            data: {
                file_name: file.filename
            }
        });

        return;
    } catch (error: any) {
        console.error('Error in createParameterController:', error);

        // return error to api
        if (error?.status === 400) {
            res.status(400).json({
                status: 102,
                message: error?.message,
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

// To delete file
async function deleteFileController(req: Request, res: Response): Promise<void> {
    try {
        // Get file name from body
        const { file_name }: { file_name: string } = req.body ?? {};

        // Construct the absolute path in src/uploads
        const filePath = path.join(__dirname, "../../src/uploads", file_name);

        // If file exist
        if (fs.existsSync(filePath)) {
            // Remove file
            fs.unlinkSync(filePath);
            res.status(200).json({
                success: true,
                message: "File removed successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

    } catch (error: any) {
        console.error('Error in deleteFile:', error);

        // return error to api
        if (error?.status === 400) {
            res.status(400).json({
                status: 102,
                message: error?.message,
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
    createParameterController,
    uploadFileController,
}
