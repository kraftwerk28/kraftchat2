'use strict';

const socket = io();

const getEl = e => document.getElementById(e);

let username = '';
let message = '';
let istyping = false;

const usernameField = getEl('username');
const messageIn = getEl('enter-message');
const messageOut = getEl('messages');
const status = getEl('status');
const sendBt = getEl('send');
const clearBt = getEl('clear');
const connectedUsers = getEl('connectedUsers');


clearBt.addEventListener('click', () => {
  socket.emit('clearChat');
  socket.emit('clearCanvas');
});

sendBt.addEventListener('click', () => {
  sendMessage();
});

usernameField.addEventListener('blur', () => {
  username = usernameField.value;
  socket.emit('usernameChange', { username: username });
});

// sending message
const sendMessage = () => {
  if (messageIn.value === '' || username === '')
    status.textContent = 'enter a username or/and message, motherfucker';
  else {
    socket.emit('newMessage', { message: messageIn.value, username: username });
    messageIn.value = '';
    console.log(messageIn.value);
  }
}

messageIn.addEventListener('input', () => {
  socket.emit('typingStart', { username: username });
});

messageIn.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    sendMessage();
  }
});


//#region socket.on
socket.on('typingStart', (data) => {
  if (data.username !== username) {
    status.textContent = data.username + ' typing...';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  }
});

socket.on('newMessage', (data) => {
  messageOut.textContent = data.messages;
  messageOut.scrollTop = messageOut.scrollHeight;
});

socket.on('connectedUsers', (data) => {
  // while (connectedUsers.firstChild)
  //   connectedUsers.removeChild(connectedUsers.firstChild);
  connectedUsers.textContent = ''
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].username !== null)
      connectedUsers.textContent += data.users[i].username + '\n';
  }
});
//#endregion
