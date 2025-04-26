import express from 'express';
import { registerUser, loginUser, editUser, 
    deleteUser, getUser } from '../controllers/userController.js';
import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.post('/register', registerUser); // POST /users/register
router.get('/loginUser', loginUser);       // POST /users/login
router.patch('/editUser', CheckAndRemakeToken, editUser);
router.delete('/deleteUser', deleteUser);
router.get('/getUser', CheckAndRemakeToken, getUser);

export default router;
