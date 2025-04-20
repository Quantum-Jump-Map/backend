import express from 'express';
import { registerUser, loginUser, editUser, 
    deleteUser, getUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser); // POST /users/register
router.post('/loginUser', loginUser);       // POST /users/login
router.post('/editUser', editUser);
router.post('/deleteUser', deleteUser);
router.post('/getUser', getUser);

export default router;
