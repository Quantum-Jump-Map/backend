import express from 'express';
import dotenv from 'dotenv';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import get_commentsRoutes from './routes/get_comments.js';
import searchRoutes from './routes/search.js';
import {__init_eventdbsync} from './eventSync/eventSync.js';

dotenv.config();
const app = express();
app.use(express.json());

// 라우터 연결
app.use('/comments', commentRoutes); //comment post, like, dislike
app.use('/users', userRoutes);  //register, login
app.use('/get_comments', get_commentsRoutes);  //get comments based on location
app.use('/search', searchRoutes); //search

__init_eventdbsync();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

