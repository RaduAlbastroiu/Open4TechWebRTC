const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

for (let i = 0; i < 5; i++) {
  io.of(`/channel-${i}`).on('connection', (socket) => {
    console.log(`someone connected to channel ${i}`);

    socket.on('message', ({ name, message }) => {
      console.log(`new message from ${name} on channel ${i}`);
      io.of(`/channel-${i}`).emit('message', { name, message });
    });
  });
}

io.on('connection', (socket) => {
  socket.on('message', ({ name, message }) => {
    io.emit('message', { name, message });
  });
});

http.listen(8000, function () {
  console.log('listening on port 8000');
});
