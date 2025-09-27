import express from 'express';
import { loginController } from '../controllers/index.controller.js';


const router = express.Router();

// TODO: ADD RATE LIMITER
router.post('/login', loginController);

export default router;