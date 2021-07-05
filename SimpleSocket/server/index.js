const http = require('http').createServer();

const io = require('socket.io')(http, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(`new user connected ${socket.id.substr(0, 5)}`);

  socket.on('message', (message) => {
    console.log(message);
    io.emit('message', `${socket.id.substr(0, 5)} said ${message}`);
  });
});

http.listen(8080, () => console.log('listening on http://localhost:8080'));
