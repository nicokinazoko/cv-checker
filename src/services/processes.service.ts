import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';


import type { BaseResponse, ProcessModel, ResultModel } from "../models/index.model.js";

import { Parameter, Process, Request, Result, User } from "../models/index.model.js";
import { checkTotalCurrentProcessingCV, getOldestPendingProcess, extractTextFromCV, getOneProcesById } from "../utils/index.util.js";


// Set directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processCv({ process_id, username }: { process_id: string, username: string }): Promise<BaseResponse<Record<string, any>>> {
    try {
        // Find parameter data
        const responsegetOneProcesById = await getOneProcesById({ process_id });

        if (!responsegetOneProcesById.success || !responsegetOneProcesById.data) {
            return {
                success: false,
                statusCode: 422,
                message: responsegetOneProcesById?.message ?? 'Process not found'
            }
        }

        // Get data process
        const currentProcess = responsegetOneProcesById.data;

        // If process is still running, return validation message
        if (currentProcess.status_process === 'processing') {
            return {
                success: false,
                statusCode: 422,
                message: 'Process is still running, please wait until finished'
            }
        }

        // Find parameter from process
        const parameterFromCurrentProcess = await Parameter.findById(currentProcess.parameter_id).lean();

        if (!parameterFromCurrentProcess) {
            return {
                success: false,
                statusCode: 422,
                message: 'Parameter not found'
            }
        }

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

        // Check how many CV being processed
        const responseCheckCurrentProcessingCv = await checkTotalCurrentProcessingCV();

        // If there is something wrong while check total processing cv, return validation messag
        if (!responseCheckCurrentProcessingCv.success) {
            return {
                success: false,
                statusCode: 422,
                message: responseCheckCurrentProcessingCv?.message ?? 'Something wrong when check processing CV'
            }
        }

        // Get total current processing CV
        const totalCurrentProcessingCV = responseCheckCurrentProcessingCv.data ?? 0;

        // If CV is processing more than 2, return validation message to not make process heavy
        if (totalCurrentProcessingCV > 2) {
            return {
                success: false,
                statusCode: 422,
                message: 'Please wait since some process is running'
            }
        }

        const filetype = parameterFromCurrentProcess.file_type;
        const fileName = parameterFromCurrentProcess.file_name;

        const responseExtractText = await extractTextFromCV({ fileName, filetype });

        if (!responseExtractText.success) {
            return {
                success: false,
                statusCode: 422,
                message: responseExtractText?.message ?? 'Something wrong when extract text'
            }
        }

        await Process.findByIdAndUpdate(currentProcess._id, {
            status_process: 'queued'
        });

        const extractedText = responseExtractText.data;

        // If extracted text is not exist, then return validation message
        if (!extractedText) {
            return {
                success: false,
                statusCode: 404,
                message: 'Data from text is not exist'
            }
        }

        // Call generate result in background
        generateResultCVUsingAI({
            process_id,
            extractedText,
            jobDescription: parameterFromCurrentProcess.job_description,
            studyCase: parameterFromCurrentProcess.study_case
        });

        return {
            success: true,
            statusCode: 200,
            data: {
                id: currentProcess._id,
                status: 'queued'
            }
        }

    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: 'Error get data from pending process'
        }
    }
}

async function getOneProcess({ process_id }: { process_id: string }): Promise<BaseResponse<Record<string, any>>> {
    try {
        const process = await Process.findById(process_id)
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

async function generateResultCVUsingAI(
    { process_id, extractedText, jobDescription, studyCase }:
        { process_id: string, extractedText: string, jobDescription: string, studyCase: string }): Promise<BaseResponse<Record<string, any>>> {
    try {
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: OPENROUTER_API_KEY,
        });

        // mark process as processing
        await Process.updateOne(
            { _id: process_id },
            { $set: { status_process: "processing" } }
        );

        const scoringParameters = `
        You are a certified CV Checker, you must can match rate between CV and job requirements

        Here is for Scoring Parameters:

        1. CV Evaluation
        - Match Rate (1–5): How well the CV matches the job requirements.
        - Technical Skills Match (1–5): Backend, databases, APIs, cloud, AI/LLM exposure.
        - Experience Level (1–5): Years of experience and project complexity.
        - Relevant Achievements (1–5): Impact, scale, and accomplishments.
        - Cultural Fit (1–5): Communication, teamwork, learning attitude.

        Final Score:
        - Each parameter scored 1–5.
        - Final score = sum or weighted average of all parameters.

        Return it with JSON with these fields, it must returned max 1 sentence
        cv_match_rate: 0-1,
        cv_feedback,
        project_score: 1-10,
        project_feedback,
        and overall_summary
        `;

        const completion = await openai.chat.completions.create({
            model: "x-ai/grok-4-fast:free",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `${scoringParameters}, 
                                    You has this extracted text from CV:  ${extractedText}, 
                                    You have this study case : ${studyCase},
                                    Job Desc is like this: ${jobDescription}, don't mention the job desc number, just tell match with jobdesc overall or some jobdesc
                                    If CV has project, you must rated it, if not exist, you can check it based on previous experience.
                                    You must check the study case is match with candidate project is match or not.`
                        },
                    ]
                }
            ],

        });

        // Create request
        await Request.create({
            process_id,
            token_used: completion?.usage?.total_tokens ?? 0,
        });

        // Create result
        const result = await Result.create({});

        if (!completion?.choices?.[0]?.message?.content) {
            await Process.updateOne(
                { _id: process_id },
                {
                    $set: {
                        status_process: "failed",
                        failure_reason: 'No content returned'
                    }
                }
            );
            return {
                success: false,
                statusCode: 422,
                message: 'There is error in generate result'
            }
        }

        const finishReason = completion.choices[0].finish_reason;
        if (finishReason !== "stop") {
            await Process.updateOne(
                { _id: process_id },
                {
                    $set: {
                        status_process: "failed",
                        failure_reason: `AI response did not complete properly. Reason: ${finishReason}`
                    }
                }
            );
            return {
                success: false,
                statusCode: 422,
                message: `AI response did not complete properly. Reason: ${finishReason}`
            };
        }

        const usage = completion.usage;
        if (usage?.total_tokens && usage.total_tokens > 120000) {
            await Process.updateOne(
                { _id: process_id },
                {
                    $set: {
                        status_process: "failed",
                        failure_reason: `Token limit exceeded: used ${usage.total_tokens}`
                    }
                }
            );
            return {
                success: false,
                statusCode: 422,
                message: `Token limit exceeded: used ${usage.total_tokens}`
            };
        }

        // --- 4. Try parsing JSON ---
        let parsed: Record<string, any>;
        try {
            parsed = JSON.parse(completion.choices[0].message.content);
        } catch (err) {
            await Process.updateOne(
                { _id: process_id },
                { $set: { status_process: "failed", failure_reason: 'Invalid JSON returned by AI' } }
            );
            return {
                success: false,
                statusCode: 422,
                message: 'Invalid JSON returned by AI'
            };
        }

        // --- 5. Schema validation ---
        const requiredFields = ["cv_match_rate", "cv_feedback", "project_score", "project_feedback", "overall_summary"];
        for (const field of requiredFields) {
            if (!(field in parsed)) {
                await Process.updateOne(
                    { _id: process_id },
                    {
                        $set: {
                            status_process: "failed",
                            failure_reason: `Missing required field: ${field}`
                        }
                    }
                );

                return {
                    success: false,
                    statusCode: 422,
                    message: `Missing required field: ${field}`
                };
            }
        }

        if (typeof parsed.cv_match_rate !== "number" || parsed.cv_match_rate < 0 || parsed.cv_match_rate > 1) {
            await Process.updateOne(
                { _id: process_id },
                {
                    $set: {
                        status_process: "failed",
                        failure_reason: "Invalid cv_match_rate, must be between 0 and 1"
                    }
                }
            );
            return {
                success: false,
                statusCode: 422,
                message: "Invalid cv_match_rate, must be between 0 and 1"
            };
        }

        if (typeof parsed.project_score !== "number" || parsed.project_score < 1 || parsed.project_score > 10) {
            await Process.updateOne(
                { _id: process_id },
                {
                    $set: {
                        status_process: "failed",
                        failure_reason: "Invalid project_score, must be between 1 and 10"
                    }
                }
            );
            return {
                success: false,
                statusCode: 422,
                message: "Invalid project_score, must be between 1 and 10"
            };
        }

        await Result.findOneAndUpdate(
            { _id: result._id },
            {
                $set: {
                    cv_match_rate: parsed.cv_match_rate,
                    cv_feedback: parsed.cv_feedback,
                    project_score: parsed.project_score,
                    project_feedback: parsed.project_feedback,
                    overall_summary: parsed.overall_summary,
                }
            },
            { upsert: true, new: true }
        );

        await Process.updateOne(
            { _id: process_id },
            {
                $set: {
                    status_process: "success",
                    result_id: result._id,
                    failure_reason: ''
                }
            }
        );

        // --- 6. Return valid result ---
        return {
            success: true,
            statusCode: 200,
            data: parsed
        };
    } catch (error) {
        // ensure request is still logged
        await Request.create({
            process_id,
            token_used: 0,
            status: "active",
        });

        // mark process as failed
        await Process.updateOne(
            { _id: process_id },
            {
                $set: {
                    status_process: "failed",
                    failure_reason: `Error in generate Result CV : ${error instanceof Error ? error.message : String(error)}`
                }
            }
        );

        console.error('Error in generate Result CV : ', error);
        return {
            success: false,
            statusCode: 500,
            message: 'Error in generate Result CV'
        }
    }
}

export {
    processCv,
    getOneProcess,
    generateResultCVUsingAI
}

