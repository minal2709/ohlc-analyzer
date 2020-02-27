module.exports = {
  tradeInputFilePath: './././srv/trades.json', // File path for the trade data set
  tradeSymbol: process.env.TRADE_SYMBOL || 'XXBTZUSD',
  barIntervalNanoSec: 15 * 1000 * 1000 * 1000, // 15 sec
  cronInterval: '*/15 * * * * *',
  fsmUrl: 'http://127.0.0.1:3000', // Url for the fsm server
  startReaderEventString: 'startReader'
};
