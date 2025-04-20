import express from 'express';
import {
  createComment,
  deleteComment,
  editComment,
  likeComment,
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/createComment', createComment);   // POST 댓글 만들기
router.delete('/deleteComment', deleteComment);   // DELETE 댓글 지우기
router.patch('/editComment', editComment);
router.patch('/likeComment', likeComment);

export default router;
