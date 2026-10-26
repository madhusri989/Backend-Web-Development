'use strict';

const { Server } = require('socket.io');

function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`[+] connected: ${socket.id}`);

    socket.on('joinRoom', (data) => {
      if (data && typeof data.room === 'string') {
        socket.join(data.room);
      }
    });

    socket.on('leaveRoom', (data) => {
      if (data && typeof data.room === 'string') {
        socket.leave(data.room);
      }
    });

    socket.on('newComment', (data) => {
      if (data && typeof data.room === 'string' && typeof data.text === 'string') {
        io.to(data.room).emit('commentAdded', data);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[-] disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = { initSocket };
