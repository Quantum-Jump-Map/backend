import express from 'express';
import {
  level1, level2, level3, level4, level5, get_all_level1,
  get_all_level2, get_all_level3, get_all_level4, get_all_level5
} from '../controllers/get_commentsController.js'; 

//import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.get('/level1', level1);
router.get('/level2', level2);
router.get('/level3', level3);
router.get('/level4', level4);
router.get('/level5', level5);
router.get('/get_all_level1', get_all_level1);
router.get('/get_all_level2', get_all_level2);
router.get('/get_all_level3', get_all_level3);
router.get('/get_all_level4', get_all_level4);
router.get('/get_all_level5', get_all_level5);

export default router;

