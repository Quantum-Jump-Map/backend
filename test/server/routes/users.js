import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser); // POST /users/register
router.post('/login', loginUser);       // POST /users/login

export default router;
