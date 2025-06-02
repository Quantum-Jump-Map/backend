import express from 'express';
import {
  search
} from '../controllers/searchController.js'; 

import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.get('/searchQuery', CheckAndRemakeToken, search);


export default router;

