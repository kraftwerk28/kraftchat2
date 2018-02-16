'use strict';

const canvas = getEl('canvas');
const context = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let oldP = [0, 0];
let newP = [0, 0];

let isMousePressed = false;

document.addEventListener('mousedown', e => {
  isMousePressed = true;
  newP = [e.x, e.y];
});
document.addEventListener('mouseup', e => {
  isMousePressed = false;
  saveImg();
});

canvas.addEventListener('mousemove', e => {
  if (isMousePressed) {
    oldP[0] = newP[0];
    oldP[1] = newP[1];
    newP[0] = e.x;
    newP[1] = e.y;
    drawLine(oldP[0], oldP[1], newP[0], newP[1]);
    socket.emit('drawLine', { oldP: oldP, newP: newP });
  }
});

const saveImg = () => {
  let i = new Image();
  i.src = canvas.toDataURL();
  socket.emit('saveImage', i);
};

const drawLine = (x1, y1, x2, y2) => {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();;
};

socket.on('restoreImg', data => {
  context.drawImage(data, 0, 0);
});

socket.on('drawLine', data => {
  drawLine(data.oldP[0], data.oldP[1], data.newP[0], data.newP[1]);
});
