const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

app.use(
  '/',
  express.static(path.join(__dirname, '../build_frontend'), {
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// enabling html5 history
app.get('/*', (req, res) => {
  const indexPath = path.join(__dirname, '../build_frontend/index.html');
  //@ts-ignore
  res.sendFile(indexPath);
});

const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data);
  });

  socket.on('callEnded', (data) => {
    io.to(data.to).emit('callEnded', data);
  });
});

console.log('asd', process.env.PORT);

server.listen(process.env.PORT, () =>
  console.log(`server is listening on port ${process.env.PORT}`)
);
