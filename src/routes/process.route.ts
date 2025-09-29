import express from 'express';
import {
    getOneProcessController
} from '../controllers/index.controller.js';

import {
    VerifyJWTToken
} from '../middlewares/index.middleware.js';

const router = express.Router();

router.get('/result/:id', VerifyJWTToken, getOneProcessController);

export default router;