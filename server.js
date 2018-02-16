'use strict';

const port = process.env.PORT || 8080;

const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const socketIO = require('socket.io')(http);

let users = [];
// let chat = [];
// fs.readFileSync('chat.json', 'utf8', (err, f) => {
//   chat = JSON.parse(f);
// });

const idIndexOf = (id) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return i;
    }
  }
  return -1;
};

app.use(express.static(__dirname + '/client'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

socketIO.on('connection', (socket) => {
  //#region user init
  console.log(socket.id + ' connected');
  users.push({ id: socket.id, username: null, admin: false });

  fs.readFile('chat.txt', 'utf8', (err, file) => {
    // console.log(file);
    socket.emit('newMessage', { messages: file });
  });
  socketIO.emit('connectedUsers', { users: users });
  fs.readFile('img.png', data => {
    socket.emit('restoreImg', data);
  });
  //#endregion


  const emitMessages = () => {
    fs.readFile('chat.txt', 'utf8', (err, file) => {
      socketIO.emit('newMessage', { messages: file });
    });
  };

  socket.on('usernameChange', (data) => {
    let i = idIndexOf(socket.id);
    users[i].username = data.username;
    socketIO.emit('connectedUsers', { users: users });
  });
  socket.on('typingStart', (data) => {
    socket.broadcast.emit('typingStart', { username: data.username })
  });

  socket.on('newMessage', (data) => {
    // chat.push({ username: data.username, message: data.message });
    // fs.writeFile('chat.txt', chat, err => { });
    fs.appendFile('chat.txt', data.username + ': ' + data.message + '\n', err => { });
    emitMessages();
    // console.log(readFromFile('chat.txt'));
  });

  socket.on('clearChat', (data) => {
    fs.writeFile('chat.txt', '', err => { });
    fileRead('chat.txt');
  });

  socket.on('drawLine', (data) => {
    socket.broadcast.emit('drawLine', data);
  });

  socket.on('saveImage', (data) => {
    fs.writeFile('img.png', data);
  });

  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
    users.splice(idIndexOf(socket.id), 1);
    socketIO.emit('connectedUsers', { users: users });
  });
});

http.listen(port);
// app.listen(port);
