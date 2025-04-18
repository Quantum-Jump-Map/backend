import express from 'express';
import dotenv from 'dotenv';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/location.js';

dotenv.config();
const app = express();
app.use(express.json());

// 라우터 연결
app.use('/comments', commentRoutes); //comment post, like, dislike
app.use('/users', userRoutes);  //register, login
app.use('/location', locationRoutes);  //get comments based on location

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
