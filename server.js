'use strict';

const port = process.env.PORT || 80;

const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io')(http);

let server;
let sockets;

server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.readFile('index.html', (err, html) => {
    res.write(html);
    res.end();
  });
}).listen(port);

sockets = socketIO.listen(server).sockets;

sockets.on('connection', (socket) => {
  fs.readFile('chat.txt', 'utf8', (err, file) => {
    socket.emit('newMessage', { messages: file });
  });

  console.log('connected');

  socket.on('typingStart', (data) => {
    socket.broadcast.emit('typingStart', { username: data.username })
  });
  socket.on('newMessage', (data) => {
    fs.appendFile('chat.txt', data.username + ': ' + data.message + '\n', (err) => {
      if (err)
        throw err;
    });
    fs.readFile('chat.txt', 'utf8', (err, file) => {
      sockets.emit('newMessage', { messages: file });
    });
  });
  socket.on('clearChat', (data) => {
    fs.writeFile('chat.txt', '', (err) => {
      if (err)
        throw err;
    })
    fs.readFile('chat.txt', 'utf8', (err, file) => {
      sockets.emit('newMessage', { messages: file });
    });
  });


});
