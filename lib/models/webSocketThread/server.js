const WebSocket = require('ws');

const constants = require('../../config/constants');
const reader = require('../tradeReader/reader');

const init = function () {
  const wss = new WebSocket.Server({ port: 5555 });
  wss.on('connection', ws => {
    ws.on('message', message => {
      if (constants.startReaderEventString === message) {
        console.log('starting reader');
        reader.init();
      } else {
        console.log(`Received unknown message => ${message}`);
      }
    });
    ws.send('Hello! Message From Server!!');
  });
};

module.exports = {
  init: init
};
