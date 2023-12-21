const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

const usersInRooms = {};

io.on('connection', (socket) => {

  socket.on('join', (room) => {
    if (socket.room) {
      socket.leave(socket.room);
    }

    socket.join(room);
    socket.room = room;

    if (!usersInRooms[room]) {
      usersInRooms[room] = [];
    }
    usersInRooms[room].push(socket.id);

    io.to(socket.room).emit('userJoined', `User ${socket.id} joined the room`);
  });

  socket.on('message', (data) => {
    io.to(socket.room).emit('message', { sender: socket.id, message: data });
  });

  socket.on('disconnect', () => {

    if (socket.room && usersInRooms[socket.room]) {
      usersInRooms[socket.room] = usersInRooms[socket.room].filter((id) => id !== socket.id);

      io.to(socket.room).emit('userLeft', `User ${socket.id} left the room`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
