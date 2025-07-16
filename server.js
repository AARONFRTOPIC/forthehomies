// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('.')); // serve index.html from current dir

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // broadcast to everyone
  });
});

server.listen(3000, () => {
  console.log('World Chat running at http://localhost:3000');
});
