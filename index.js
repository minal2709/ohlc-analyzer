const Hapi = require('@hapi/hapi');

const reader = require('./lib/models/tradeReader/reader');
const computer = require('./lib/models/fsm/computer');
// const wsServer = require('./lib/models/webSocketThread/server');

const init = async () => {
  // Creating a Hapi server for fsm worker
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });
  // Adding compute and flush POST request for bar data
  server.route([{
    method: 'POST',
    path: '/fsm/compute',
    handler: function (req) {
      const { barLine } = req.payload;
      computer.compute(barLine);
      return '{ statusCode: 200, message: "Data received" }';
    }
  }, {
    method: 'POST',
    path: '/fsm/flush',
    handler: function () {
      computer.flush();
      setTimeout((function () {
        // Exiting the process since this route is only called when reading the file is over.
        return process.exit(22);
      }), 2000);
      return '{ statusCode: 200, message: "Data flushed" }';
    }
  }]);
  await server.start();
  console.log('Server running on %s', server.info.uri);
  // Initializing the reader class for reading data
  reader.init();
  // wsServer.init();
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

process.on('exit', function (code) {
  return console.log('About to exit with code', code);
});

init();
