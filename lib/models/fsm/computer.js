const constants = require('../../config/constants');

const ohlcNptifyEventString = 'ohlc_notify';

let barData; // Array of data within one bar interval
let barIndex = 0; // Bar num, increamented after each bar interval
let barStartTS; // Timestamp of the first data in current bar interval
let barVolume; // Total quantity with current bar interval
let barOpen; // Price at which current interval began
let barClose; // Price at which current interval closed
let barHigh; // Highest price in the current interval
let barLow; // Lowest price in the current interval
let totalData = 0;

/** struct definitions:
barLine {
  sym: Stock name string
  T: Ignore this field string
  P: Price of Trade double
  Q: Quantity Traded double
  TS: Ignore this field uint64
  Side: Ignore this field string
  TS2: Timestamp in UTC uint64
};
barOHLC {
  event: "ohlc_notify" constant string
  symbol: Stock name string (sym)
  bar_num: barIndex int
  o: Bar Open double
  h: Bar Close double
  l: Bar High double
  c: Bar Low double
  volume: total quantity aggregated within barInterval double
}

This function sets the barHigh, barLow, barClose and barVolume.
It also converts the incoming barLine to barOHLC object required for the output
*/
const constructBarData = function (barLine) {
  if (barHigh < barLine.P) {
    barHigh = barLine.P;
  }
  if (barLow > barLine.P) {
    barLow = barLine.P;
  }
  barClose = barLine.P;
  barVolume += barLine.Q;
  totalData += 1;
  const barOHLC = {
    event: ohlcNptifyEventString,
    symbol: barLine.sym,
    bar_num: barIndex,
    o: barOpen,
    h: barHigh,
    l: barLow,
    c: 0.0,
    volume: barVolume
  };
  return barOHLC;
};


// This function returns true if difference between the given timestamps is lesser than barInterval
const checkBarInterval = function (ts1, ts2) {
  return (ts2 - ts1) < constants.barIntervalNanoSec;
};

/**
This function initializes all the values pertaining to a barInterval
1. Increments the barIndex by 1
2. Sets the barStartTS to given data's timestamp
3. Initializes barData to null list
4. Sets barVolue to 0
5. Sets all 4 OHLC values to given data's price
*/
const initData = function (barLine) {
  barIndex += 1;
  barStartTS = barLine.TS2;
  barData = [];
  barVolume = 0.0;
  barOpen = barLine.P;
  barHigh = barLine.P;
  barLow = barLine.P;
  barClose = barLine.P;
};

/**
If there is data in the barData, log ever entry in single line (TODO handle as needed)
Set barStartTS and barData to null
*/
const printData = function () {
  if (barData && barData.length > 0) {
    barData[barData.length - 1].c = barClose;
    console.log('Printing for index: ', barIndex, ' count: ', barData.length);
    barData.forEach(function (element) {
      console.log(JSON.stringify(element));
    });
  }
  barStartTS = null;
  barData = null;
};

/**
If barStartTs is not set i.e. there is no current interval, initialize data
If current data does not fit in the barInterval, print data and initialize data
Push the data in barData by converting the object OHLC data
*/
const compute = function (barLineString) {
  const barLine = JSON.parse(barLineString);
  if (!barStartTS) {
    initData(barLine);
  }
  if (!checkBarInterval(barStartTS, barLine.TS2)) {
    printData();
    initData(barLine);
  }
  barData.push(constructBarData(barLine));
};

// Simply prints what ever data is present in barData
const flush = function () {
  printData();
  console.log('Total number of dataset computed : ', totalData);
};

/**
// Schedule a cron to run every 15 seconds i.e. barInterval
const schedule = require('node-schedule');
schedule.scheduleJob(constants.cronInterval, function () {
  console.log('Scheduled print running at ', new Date());
  printData();
});
*/


module.exports = {
  compute: compute,
  flush: flush
};

/** const str = ['{"sym":"XXBTZUSD", "T":"Trade", "P":6538.2, "Q":0.498558, "TS":1538409739.1111, "side": "s", "TS2":1538409718332223252}',
  '{"sym":"XZECXXBT", "T":"Trade",  "P":0.01947, "Q":0.1, "TS":1538409720.3813, "side": "s", "TS2":1538409725339216503}',
  '{"sym":"XETHZUSD", "T":"Trade",  "P":226.85, "Q":0.02, "TS":1538409733.3449, "side": "b", "TS2":1538409738828589281}',
  '{"sym":"XETHZUSD", "T":"Trade",  "P":226.85, "Q":4.98, "TS":1538409733.3502, "side": "b", "TS2":1538409738828643608}',
  '{"sym":"XXBTZUSD", "T":"Trade",  "P":6538.8, "Q":1, "TS":1538409739.0962, "side": "s", "TS2":1538409748332169137}'];
str.forEach(function (element) {
  compute(element);
});
flush(); */
