import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const timeOut = process.env.JWT_EXPIRES_IN;

export function registerChatNamespace(io) {
    
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

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
        });

        socket.on('sendMessage', ({roomId, message}) => {
            chat.to(roomId).emit('message', {
                username: socket.user.username,
                message: message,
            });
        });
    });
}