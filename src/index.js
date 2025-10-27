const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Server } = require('socket.io');

const app = express();

const port = Number(process.env.PORT || 3000);

app.use(express.json());

const corsOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/[a-z0-9-]+\.brs\.devtunnels\.ms(:\d+)?$/
];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(cookieParser());

if ((process.env.STORAGE_DRIVER || 'local') === 'local') {
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }));
}

app.set('trust proxy', 1);

require('./services/swagger');
require('./routes')(app);
app.use('/v1/docs', express.static('./src/views'));
app.use('/docs/swagger.yaml', express.static('./src/docs/swagger.yaml'));

const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: corsOrigins,
    credentials: true
  }
});

io.on('connection', (socket) => {
  const userId = Number(socket.handshake.auth && socket.handshake.auth.userId);
  if (userId) socket.join(`user:${userId}`);
});

const { startOutboxPump } = require('./services/queue');
startOutboxPump(io);

server.listen(port, () => {
  console.log(`[api] Server + Socket.IO rodando na porta ${port}`);
});

module.exports = { app, server, io };
