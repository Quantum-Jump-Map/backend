import {
    createComment, deleteComment, editComment,
    likeComment, reportComment
} from '../controllers/comments2Controller.js'

import express from 'express';
import { CheckAndRemakeToken } from '../JWT/middleware.js';

const Router = express.Router();

Router.post('/createComment', CheckAndRemakeToken, createComment);
Router.post('/deleteComment', CheckAndRemakeToken, deleteComment);
Router.post('/editComment', CheckAndRemakeToken, editComment);
Router.post('/likeComment', CheckAndRemakeToken, likeComment);
Router.post('/reportComment', CheckAndRemakeToken, reportComment);


export default Router;