import express from 'express';
import {
  createComment,
  deleteComment,
  editComment,
  likeComment,
} from '../controllers/commentsController.js';

import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.post('/createComment', CheckAndRemakeToken, createComment);   // POST 댓글 만들기
router.delete('/deleteComment', CheckAndRemakeToken, deleteComment);   // DELETE 댓글 지우기
router.patch('/editComment', CheckAndRemakeToken, editComment);
router.post('/likeComment', CheckAndRemakeToken, likeComment);

export default router;

