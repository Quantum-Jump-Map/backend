import express from 'express';
import dotenv from 'dotenv';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import get_commentsRoutes from './routes/get_comments.js';
import searchRoutes from './routes/search.js';
import comment2Routes from './routes/comments2.js';
import {__init_eventdbsync} from './eventSync/eventSync.js';
import {Server} from 'socket.io';
import http from 'http';
import { registerChatNamespace } from './socket/chat.js';
import chatRoutes from './routes/chat.js';
import fcmRoutes from './routes/fcmtoken.js';


dotenv.config();
const app = express();
app.use(express.json());

// 라우터 연결
app.use('/comments', commentRoutes); //comment post, like, dislike
app.use('/users', userRoutes);  //register, login
app.use('/get_comments', get_commentsRoutes);  //get comments based on location
app.use('/search', searchRoutes); //search
app.use('/chat', chatRoutes);
app.use('/fcmtoken', fcmRoutes);  //fcm 토큰 관련
app.use('/comments2', comment2Routes);

const server = http.createServer(app);
const io = new Server(server);

registerChatNamespace(io);



__init_eventdbsync();

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

