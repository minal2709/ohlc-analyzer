const WebSocket = require('ws');

const constants = require('../../config/constants');

const socket = new WebSocket('ws://localhost:5555');

// Subscribe and start reader
socket.addEventListener('open', () => {
  socket.send(constants.startReaderEventString);
});

socket.addEventListener('message', event => {
  console.log(`Message from server: ${event.data}`);
});
