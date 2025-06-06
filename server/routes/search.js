import express from 'express';
import {
  userSearch
} from '../controllers/searchController.js'; 

import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.get('/searchQuery', CheckAndRemakeToken, userSearch);


export default router;

