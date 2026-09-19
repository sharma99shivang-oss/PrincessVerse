import { Server } from 'socket.io';

let io;

const onlineUsers = new Map();

export function initSocket(server) {

    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'https://princess-verse-frontend-1y4g.vercel.app'
            ],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {

        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit('online-users', Array.from(onlineUsers.keys()));
        });

        socket.on('typing', (data) => {
            socket.broadcast.emit('typing', data);
        });

        socket.on('stop-typing', () => {
            socket.broadcast.emit('stop-typing');
        });

        socket.on('send-message', (message) => {
            socket.broadcast.emit('receive-message', message);
        });

        socket.on('seen-message', (messageId) => {
            socket.broadcast.emit('seen-message', messageId);
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }

            io.emit('online-users', Array.from(onlineUsers.keys()));
        });

    });
}

export function getIO() {
    return io;
}