import express from 'express';
import {
    getOneProcessController,
    processCVController
} from '../controllers/index.controller.js';

import {
    VerifyJWTToken
} from '../middlewares/index.middleware.js';

const router = express.Router();

router.get('/result/:id', VerifyJWTToken, getOneProcessController);
router.post('/evaluate', VerifyJWTToken, processCVController);

export default router;