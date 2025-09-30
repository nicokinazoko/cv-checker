import { Parameter, Process } from '../models/index.model.js';
import { getUserByUsername } from './user.service.js';

// Import type
import type {BaseResponse, CreateParameterParams } from '../models/index.model.js';

async function createParameter({ file_name,
    file_type,
    job_description,
    study_case,
    username
}: CreateParameterParams): Promise<BaseResponse> {
    try {

        // If parameter not exist, return validation message
        if (!file_name || !file_type || !job_description || !study_case || !username) {
            return {
                success: false,
                statusCode: 422,
                message: 'Upload has missing parameter'
            }
        }

        // Get user from username
        const responseGetUserByUsername = await getUserByUsername({ username });

        // If user not exist, return validation message
        if (!responseGetUserByUsername.success || !responseGetUserByUsername.data) {
            return {
                success: false,
                statusCode: 422,
                message: 'User not exist'
            }
        }

        // Save input to parameter
        const createdParameter = await Parameter.create({
            file_type,
            file_name,
            job_description,
            study_case,
        });

        // Create process with status pending
        const createdProcess = await Process.create({
            user_id: responseGetUserByUsername.data._id,
            parameter_id: createdParameter._id
        });

        return {
            success: true,
            statusCode: 200,
            data: {
                process_id: createdProcess._id,
            }
        }
    } catch (error) {
        console.log(`Error in create process`, error);

        return {
            success: false,
            message: 'Error when login',
            statusCode: 500
        }
    }
}

export {
    createParameter
}