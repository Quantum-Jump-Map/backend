import express from 'express';
import { registerUser, loginUser, editUser, 
    deleteUser, getUser, followUser, getProfile } from '../controllers/userController.js';
import { CheckAndRemakeToken } from '../JWT/middleware.js';

const router = express.Router();

router.post('/register', registerUser); // POST /users/register
router.post('/loginUser', loginUser);       // POST /users/login
router.patch('/editUser', CheckAndRemakeToken, editUser);
router.delete('/deleteUser', deleteUser);
router.get('/getUser', CheckAndRemakeToken, getUser);
router.post('/followUser', CheckAndRemakeToken, followUser);
router.get('/getProfile', CheckAndRemakeToken, getProfile);

export default router;
