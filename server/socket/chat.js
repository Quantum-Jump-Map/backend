import jwt from 'jsonwebtoken';
import {make_room, insert_message} from './messageAPI.js';

const secretKey = process.env.JWT_SECRET;
const timeOut = process.env.JWT_EXPIRES_IN;

export async function registerChatNamespace(io) {
    
    const chat = io.of('/chat');

    chat.use((socket, next) => {
        
        try{
        
            const token = socket.handshake.auth?.token;
            if(!token)
            {
                console.log("error: no token");
                return next(new Error("no token"));
            }

            const decoded = jwt.verify(token, secretKey);  //id, username
            const payload = {
                id: decoded.id,
                username: decoded.username
            };

            socket.newToken = jwt.sign(payload, secretKey, {expiresIn: timeOut});
            socket.user = payload;

            next();

        } catch(err){
            console.log("error: ", err.message);
            return next(new Error("token related error"));
        }
    });

    chat.on('connection', (socket) => {
        
        console.log('socket chat 접속: ', socket.id);

        socket.emit('newToken', socket.newToken);

        socket.on('joinRoom', async (roomId) => {

            const room_name = await make_room(roomId);

            socket.join(roomId);

            socket.emit('room_info', {
                roomId: roomId,
                room_name: room_name
            });
            
        });

        socket.on('sendMessage', async ({roomId, message}) => {
            
            const res = await insert_message({roomId, message}, socket.user.username);

            chat.to(roomId).emit('message', {
                username: socket.user.username,
                message: message, 
                message_id: res.id,
                timestamp: res.posted_at
            });
        });

        socket.on('leaveRoom', (roomId) => {
            socket.leave(roomId);
            console.log(`left room: ${socket.user.username}`);
        });
    });
}