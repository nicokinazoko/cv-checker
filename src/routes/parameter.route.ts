import express from 'express';

import {
    createParameterController,
    uploadFileController,
    deleteFileController
} from '../controllers/index.controller.js';

import {
    VerifyJWTToken,
    upload
} from '../middlewares/index.middleware.js';
import { create } from 'domain';

// 
const FileRouter = express.Router();
const ParameterRouter = express.Router();

// TODO: ADD RATE LIMITER
FileRouter.post('/create', VerifyJWTToken, createParameterController);

FileRouter.post('/upload', VerifyJWTToken, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            res.status(422).json({
                'success': false,
                message: 'Upload only 1 file'
            })
            return;
        }
        else {
            // call your normal controller here
            uploadFileController(req, res);
        }
    });
});

FileRouter.post('/remove', VerifyJWTToken, deleteFileController);

ParameterRouter.post('/create', VerifyJWTToken, createParameterController);
// FileRouter.post('/upload', VerifyJWTToken, createParameterController);
// FileRouter.post('/evaluate');

// FileRouter.get('/result/:id');

export {
    FileRouter,
    ParameterRouter
}