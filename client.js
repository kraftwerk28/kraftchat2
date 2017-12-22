'use strict';

socket = io();

const getEl = e => document.getElementById(e);

let username = 'kraftwerk28';
let message = '';
let istyping = false;

const usernameField = getEl('username');
const messageIn = getEl('enter-message');
const messageOut = getEl('messages');
const status = getEl('status');

messageIn.addEventListener('input', () => {
  socket.emit('typingStart', { username: username });
});



socket.on('typingStart', (data) => {
  if (data.username !== username) {
    status.textContent = data.username + ' typing...';
    setInterval(() => {
      status.textContent = '';
    }, 1000);
  }
});
