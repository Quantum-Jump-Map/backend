import express from 'express';
import {
  level1, level2, level3, level4
} from '../controllers/get_commentsController.js'; 

//import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.get('/level1', level1);
router.get('/level2', level2);
router.get('/level3', level3);
router.get('/level4', level4);

export default router;

