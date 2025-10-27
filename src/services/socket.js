const http = require('http');
const { Server } = require('socket.io');

const PORT = Number(process.env.WS_PORT || 8081);
const server = http.createServer();
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    const userId = Number(socket.handshake.auth && socket.handshake.auth.userId);
    if (userId) socket.join(`user:${userId}`);
});

server.listen(PORT, () => {
    console.log(`[ws] Socket.IO ouvindo em :${PORT}`);
});

module.exports = { io };
