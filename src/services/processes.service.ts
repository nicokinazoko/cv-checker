import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


import type { BaseResponse, ProcessModel, ResultModel } from "../models/index.model.js";

import { Parameter, Process, User } from "../models/index.model.js";
import { checkTotalCurrentProcessingCV, getOldestPendingProcess, extractTextFromCV } from "../utils/index.util.js";


// Set directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function getOneProcess({ process_id }: { process_id: string }): Promise<BaseResponse<Record<string, any>>> {
    try {
        const process = await Process.findById(process_id)
            // .populate('result_id')
            .populate<{ result_id: ResultModel }>('result_id')
            .lean();

        if (!process) {
            return {
                success: false,
                statusCode: 404,
                message: 'Result not found'
            }
        }

        const getstatusProcess = process.status_process;

        const statusProcessNotCompleted = ['queued', 'processing'];
        if (statusProcessNotCompleted.includes(getstatusProcess)) {
            return {
                success: true,
                statusCode: 200,
                data: {
                    id: process._id,
                    status: 'queued'
                }
            }
        } else if (getstatusProcess === 'success' && process.result_id) {
            return {
                success: true,
                statusCode: 200,
                data: {
                    id: process._id,
                    status: getstatusProcess,
                    result: {
                        cv_match_rate: process.result_id.cv_match_rate,
                        cv_feedback: process.result_id.cv_feedback,
                        project_score: process.result_id.project_score,
                        project_feedback: process.result_id.project_feedback,
                        overall_summary: process.result_id.overall_summary,
                    }
                }
            }
        } else {
            return {
                success: true,
                statusCode: 200,
                data: {
                    id: process._id,
                    status: getstatusProcess
                }
            }
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: 'Error get data from get one process'
        }
    }
}

export {
    getOneProcess
}

