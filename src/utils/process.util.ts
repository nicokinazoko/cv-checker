import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from "mammoth";
import { Types } from 'mongoose';

import { Process, User } from '../models/index.model.js';

import type { BaseResponse, ParameterModel, ProcessModel } from "../models/index.model.js";

// Set directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractTextFromCV({ filetype, fileName }: { filetype: string, fileName: string }): Promise<BaseResponse<string>> {
    try {
        if (!filetype || !fileName) {
            return {
                success: false,
                statusCode: 422,
                message: 'Parameter extract text must be filled'
            }
        }

        const allowedFileType = ['pdf', 'txt', 'docx', 'doc'];

        if (!allowedFileType.includes(filetype)) {
            return {
                success: false,
                statusCode: 422,
                message: 'file type is not pdf, txt, doc, or docx'
            }
        }

        // Construct the absolute path in src/uploads
        const filePath = path.join(__dirname, "../../src/uploads", fileName);

        // If file not exist, return validation message
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                statusCode: 422,
                message: 'file is not found'
            }
        }

        let extractedText;
        let responseConversion = null
        if (filetype === 'pdf') {
            responseConversion = await extractTextFromPDF({ filename: fileName });
        } else if (filetype === 'doc' || filetype === 'docx') {
            responseConversion = await extractTextFromWord({ filename: fileName });
        } else {
            responseConversion = await extractTextFromTXT({ filename: fileName });
        }

        if (!responseConversion.success || !responseConversion?.data) {
            return {
                success: responseConversion.success,
                statusCode: responseConversion.statusCode,
                message: responseConversion?.message ?? 'Error when extract text from CV'
            }
        }

        extractedText = responseConversion.data
        return {
            success: true,
            statusCode: 200,
            data: extractedText
        }

    } catch (error) {
        console.error('Error when extrat text from cv', error);

        return {
            success: false,
            statusCode: 500,
            message: 'Error when extrat text from cv'
        }
    }
}

async function extractTextFromPDF({ filename }: { filename: string }): Promise<BaseResponse<string>> {
    try {
        // Define file path for file
        const filePath = path.join(__dirname, "../../src/uploads", filename);

        // If file not exist, return validation message
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                statusCode: 422,
                message: 'file is not found'
            }
        }

        // Get file 
        const fileBuffer = fs.readFileSync(filePath);

        const data = await pdf(fileBuffer);

        return {
            success: true,
            statusCode: 200,
            data: data.text
        }

    } catch (error) {
        console.error('Error when extract text from cv pdf', error);

        return {
            success: false,
            statusCode: 500,
            message: 'Error when extrat text from cv'
        }
    }
}

async function extractTextFromWord({ filename }: { filename: string }): Promise<BaseResponse<string>> {
    try {
        // Get file path
        const filePath = path.resolve("src/uploads", filename);

        // If file not exist, return validation message
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                statusCode: 422,
                message: 'file is not found'
            }
        }

        // Read file as buffer
        const fileBuffer = fs.readFileSync(filePath);

        // Extract text using Mammoth
        const result = await mammoth.extractRawText({ buffer: fileBuffer });

        // Return value
        return {
            success: true,
            statusCode: 200,
            data: result.value
        }

    } catch (error) {
        console.error('Error when extract text from cv word', error);

        return {
            success: false,
            statusCode: 500,
            message: 'Error when extrat text from cv word'
        }
    }
}

async function extractTextFromTXT({ filename }: { filename: string }): Promise<BaseResponse<string>> {
    try {
        const filePath = path.resolve("src/uploads", filename);

        // If file not exist, return validation message
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                statusCode: 422,
                message: 'file is not found'
            }
        }

        // Read file as string directly
        const text = fs.readFileSync(filePath, "utf-8");

        // Return value
        return {
            success: true,
            statusCode: 200,
            data: text
        }
    } catch (error) {
        console.error('Error when extract text from cv txt', error);

        return {
            success: false,
            statusCode: 500,
            message: 'Error when extrat text from cv txt'
        }
    }
}

async function getOneProcesById({ process_id }: { process_id: string }): Promise<BaseResponse<ProcessModel>> {
    try {
        if (!process_id) {
            return {
                success: false,
                statusCode: 422,
                message: 'Parameter process id is missing'
            }
        }

        const currentProcess = await Process.findById(process_id).lean();
        if (!currentProcess) {
            return {
                success: false,
                statusCode: 404,
                message: 'Process not found'
            }
        }

        return {
            success: true,
            statusCode: 200,
            data: currentProcess
        }
    } catch (error) {
        console.error('Error when get proces by id: ', error);
        return {
            success: false,
            statusCode: 500,
            message: 'Error when get process by id'
        }
    }
}

async function checkTotalCurrentProcessingCV(): Promise<BaseResponse<number>> {
    try {
        // Find data that still active and has status processing
        const totalData = await Process.find({
            status: 'active', status_process: 'processing'
        }).countDocuments();

        return {
            success: true,
            statusCode: 200,
            data: totalData
        }
    } catch (error) {
        console.error('Error when check total current process', error);

        return {
            success: false,
            statusCode: 500,
            message: 'Error when extrat text from cv txt'
        }
    }
}

async function getOldestPendingProcess({ parameter_id, username }: { parameter_id: string, username: string }): Promise<BaseResponse<ProcessModel>> {
    try {

        // Get user by username and status active
        const currentUser = await User.findOne({
            username, status: 'active'
        }).
            select('_id')
            .lean();


        // If user not exist, return validation message
        if (!currentUser) {
            return {
                success: false,
                message: 'User not found',
                statusCode: 422
            }
        }

        const oldestProcess = await Process.findOne({
            parameter_id,
            user_id: currentUser._id,
            status_process: 'pending',
            status: 'active'
        }).sort({ createdAt: 1 }).lean();

        if (!oldestProcess) {
            return {
                success: false,
                statusCode: 422,
                message: 'There is no process pending, you can create new one'
            }
        }

        return {
            success: true,
            statusCode: 200,
            data: oldestProcess
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: 'Error get data from pending process'
        }
    }
}

export {
    checkTotalCurrentProcessingCV,
    getOldestPendingProcess,
    extractTextFromCV,
    getOneProcesById
}