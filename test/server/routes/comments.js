import express from 'express';
import {
  createComment,
  getComments,
} from '../controllers/commentController.js';

const router = express.Router();

router.post('/', createComment);   // POST /comments
router.get('/', getComments);      // GET /comments

export default router;
