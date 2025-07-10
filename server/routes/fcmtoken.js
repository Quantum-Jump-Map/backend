import express from 'express';
import { CheckAndRemakeToken } from '../JWT/middleware.js';
import {login, logout} from '../controllers/fcmtokenController.js';

const router = express.Router();

router.post('/login', CheckAndRemakeToken, login);
router.post('/logout', CheckAndRemakeToken, logout);

export default router;