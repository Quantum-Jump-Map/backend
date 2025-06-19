import express from 'express';
import {message_like, get_previous_message, enter_room} from '../controllers/chatController.js';
import { CheckAndRemakeToken } from '../JWT/middleware.js';


const router = express.Router();


router.post('/like_message', CheckAndRemakeToken, message_like);   //1. 채팅 좋아요 / 취소 
router.get('/get_previous_message', CheckAndRemakeToken, get_previous_message);  // 2. 이전 채팅 내역 조회
router.get('/enter_room', CheckAndRemakeToken, enter_room);   // 3. 처음 입장할 때



export default router;
