const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

for (let i = 0; i < 5; i++) {
  io.of(`/channel-${i}`).on('connection', (socket) => {
    console.log(`connected on channel ${i}`);

    // querry database for id channel, last 50 => res
    // socket.emit(res)

    socket.on('message', ({ name, message }) => {
      console.log(`new message from ${name} on channel ${i}`);
      io.of(`/channel-${i}`).emit('message', { name, message });
      // database save -> {id: channelId, from: name, message: message}
    });
  });
}

http.listen(8000, () => {
  console.log('listening on port 8000');
});
