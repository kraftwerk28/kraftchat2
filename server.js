'use strict';

const port = process.env.PORT || 8080;

const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const socketIO = require('socket.io')(http);

let users = [];

const idIndexOf = (id) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return i;
    }
  }
  return -1;
};

app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

socketIO.on('connection', (socket) => {
  console.log(socket.id + ' connected');
  users.push({ id: socket.id, username: null, admin: false });

  const fileRead = (file) => {
    fs.readFile(file, 'utf8', (err, file) => {
      socketIO.emit('newMessage', { messages: file });
    });
  };

  socket.on('usernameChange', (data) => {
    let i = idIndexOf(socket.id);
    users[i].username = data.username;
    socketIO.emit('connectedUsers', { users: users });
  });

  fs.readFile('chat.txt', 'utf8', (err, file) => {
    socket.emit('newMessage', { messages: file });
  });
  socketIO.emit('connectedUsers', { users: users });

  socket.on('typingStart', (data) => {
    socket.broadcast.emit('typingStart', { username: data.username })
  });

  socket.on('newMessage', (data) => {
    fs.appendFile('chat.txt', data.username + ': ' + data.message + '\n', err => { });
    fileRead('chat.txt');
  });

  socket.on('clearChat', (data) => {
    fs.writeFile('chat.txt', '', err => { });
    fileRead('chat.txt');
  });

  socket.on('drawLine', (data) => {
    socket.broadcast.emit('drawLine', data);
  });

  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
    users.splice(idIndexOf(socket.id), 1);
    socketIO.emit('connectedUsers', { users: users });
  });
});

http.listen(port);
