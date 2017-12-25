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

const canvas = getEl('canvas');
const context = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let isMousePressed = false;
let oldP = [0, 0];
let newP = [0, 0];

//#region addEventListeners
document.addEventListener('mousedown', (e) => {
  isMousePressed = true;
  newP = [e.x, e.y];
});
document.addEventListener('mouseup', (e) => {
  isMousePressed = false;
});
canvas.addEventListener('mousemove', (e) => {
  if (isMousePressed) {
    oldP[0] = newP[0];
    oldP[1] = newP[1];
    newP[0] = e.x;
    newP[1] = e.y;
    drawLine(oldP[0], oldP[1], newP[0], newP[1]);
    socket.emit('drawLine', { oldP: oldP, newP: newP });
  }
});


clearBt.addEventListener('click', () => {
  socket.emit('clearChat', {});
});

sendBt.addEventListener('click', () => {
  sendMessage();
});

usernameField.addEventListener('blur', () => {
  username = usernameField.value;
  socket.emit('usernameChange', { username: username });
});
//#endregion

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

const drawLine = (x1, y1, x2, y2) => {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();;
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

socket.on('drawLine', (data) => {
  drawLine(data.oldP[0], data.oldP[1], data.newP[0], data.newP[1]);
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
