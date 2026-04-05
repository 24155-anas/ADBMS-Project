require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Export so controllers can emit events
module.exports = { io };

io.on('connection', (socket) => {
    const { role, userId } = socket.handshake.auth || {};

    // Drivers join a shared room so all can see new ride requests
    if (role === 'driver') {
        socket.join('drivers');
    }

    // Each customer gets their own room so the right person is notified
    if (userId) {
        socket.join(`customer_${userId}`);
    }

    socket.on('disconnect', () => { });
});

(async () => {
    await testConnection();
    server.listen(PORT, () => {
        console.log(`API running on  http://localhost:${PORT}`);
        console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
})();

