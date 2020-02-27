const readline = require('readline');
const fs = require('fs');
const axios = require('axios');

const constants = require('../../config/constants');

let dataCount = 0;

// Handles the axios error
const handleAxiosError = function (error) {
  /** if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
  }
  console.log(error.config); */
  console.log(error.message);
};

// Makes a POST http call to fsmServer for data flushing
const makeFlushCall = async function () {
  // Makes the flush call to the fsm worker
  axios.post(constants.fsmUrl.concat('/fsm/flush'))
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      // TODO Handle error properly, right now only logging it.
      handleAxiosError(error);
    })
    .then(() => {
      console.log('Total number of dataset read : ', dataCount);
    });
};

// Makes a POST http call to fsmServer for computing
const makeComputeCall = async function (line) {
  const data = JSON.parse(line);
  if (constants.tradeSymbol === data.sym) {
    // Makes the compute call to the fsm worker
    await axios.post(constants.fsmUrl.concat('/fsm/compute'), { barLine: line })
      .then(() => {
        // Do nothing
        // console.log(res.data);
      })
      .catch((error) => {
        // TODO Handle error properly, right now only logging it.
        handleAxiosError(error);
      });
  }
};

/** const init = function () {
  // create instance of readline
  // each instance is associated with single input stream
  console.log('Creating Read Stream');
  const rl = readline.createInterface({
    input: fs.createReadStream(constants.tradeInputFilePath)
  });

  // event is emitted after each line
  rl.on('line', function (line) {
    makeComputeCall(line);
  });

  // end
  rl.on('close', function () {
    console.log('Reached end of file.');
    makeFlushCall();
  });
}; */

/**
Creates a read stream and for each line, make the compute call.
At the end of the file, make a flush call.
*/
const init = async function () {
  console.log('Starting the reader for trade symbol: ', constants.tradeSymbol);
  // create instance of readline
  // each instance is associated with single input stream
  const fileStream = fs.createReadStream(constants.tradeInputFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    dataCount += 1;
    // Each line in input.txt will be successively available here as `line`.
    await makeComputeCall(line);
  }
  await makeFlushCall();
};

module.exports = {
  init: init
};
