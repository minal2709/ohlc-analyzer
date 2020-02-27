Problem Statement:
Create an Analytical Server "OHLC" (Open/High/Low/Close) time series based on the 'Trades' input dataset. The ‘Trades’ dataset is available at http://kaboom.rksv.net/trades-test/trades-data.zip
Instructions to setup and run the solution on a LINUX environment:
Assuming it has npm installed.
Download the tar file on the server
Unzip the project
unzip ohlc-analyzer.tar
Enter the project folder
cd ohlc-analyzer
Install dependencies
npm install
Start the server
npm start

If you want the output in a file use: 
npm start > app.log 2>&1

By default the trade symbol is 'XXBTZUSD', in order to see data for another symbol use: 
TRADE_SYMBOL='trade_symbol' npm start
eg. TRADE_SYMBOL='XETHZUSD' npm start > app.log 2>&1 //This will get all data for 'XETHZUSD' and log in file app.log

Kindly note that the process is killed once the flush call is made. Since the web socket is not implemented
subscribe event is equal to npm start. This means 1 run of the program will work for only 1 trade symbol.

Also the input file is assumed to have the correct data. Error in the file is not handled yet.






Input
a. Samples from the JSON file for ease of reference
{"sym":"XETHZUSD", "T":"Trade", "P":226.85, "Q":0.02,
"TS":1538409733.3449, "side": "b", "TS2":1538409738828589281}
{"sym":"XETHZUSD", "T":"Trade", "P":226.85, "Q":4.98,
"TS":1538409733.3502, "side": "b", "TS2":1538409738828643608}
{"sym":"XXBTZUSD", "T":"Trade", "P":6538.8, "Q":1,
"TS":1538409739.0962, "side": "s", "TS2":1538409748332169137}
{"sym":"XXBTZUSD", "T":"Trade", "P":6538.2, "Q":0.498558,
"TS":1538409739.1111, "side": "s", "TS2":1538409748332223252}
b. Keys and their associated meanings:
struct barOHLC {
  sym : Stock name string
  T: Ignore this field string
  P: Price of Trade double
  Q: Quantity Traded double
  TS: Ignore this field uint64
  Side: Ignore this field string
  TS2: Timestamp in UTC uint64
};
c. Additional Design Criteria (As stated)
Done:
a. The 15-second bar starts on the first trade, and maintains the bar_num series.
b. Every bar is identified by its bar_num attribute, starting at 1, and incrementing
c. The 15-second bar closes upon the expiration of the bar-interval.
d. The next 15-second bar starts with bar_num++ as its identifier,

To be Implemented:
e. Don't wait for the next trade to start the next bar.
f. You can have empty bars during a 15 second interval! (Acceptable)
Technical document 0.1
Language: NodeJS.

There will be 3 workers performing their individual task as follows:

Worker_1:
Reads the Trades data input (line by line from JSON), and sends the packet to the FSM (Finite-State-Machine) thread using post req.
reader.js: Use fs to read the file line by line
    Read ‘tradeSymbol’ from the env var, the entire process will run for this symbol only
    for each line --> if data is for the `tradeSymbol`, make the compute request synchronously.
    At the end of the file make the flush request.
Worker_2: 
(FSM) computes OHLC packets based on 15 seconds (interval) and constructs 'BAR' chart data, based on timestamp TS2.
computer.js: Reads the json to form barOHLC object
    barData
    barIndex = 0
    barStartTS
    barOpen
    barClose
    barHigh
    barLow
    barVolume

    compute(barLine)
      if (!barStartTS) {
        initData(barLine.TS2)
      }
      if (!checkBarInterval(barStartTS, barLine.TS2)) {
        printData()
        initData(barLine.TS2)
      }
      barData.push(constructBarData(barLine))
    
    constructBarData(barLine)
      if (barHigh < barLine.P) {
        barHigh = barLine.P;
      }
      if (barLow > barLine.P) {
        barLow = barLine.P;
      }
      barClose = barLine.P;
      barVolume += barLine.Q;
      convert the barLine to the required object
    initData(barLine)
      barIndex ++
      barStartTS = ts
      barData = []
      barVolume = 0.0;
      barOpen = barLine.P;
      barHigh = barLine.P;
      barLow = barLine.P;
      barClose = 0.0
    printData()
      if (barData.size > 0)
        barData[barData.length - 1].c = barClose;
        print data
      barStartTS = null
      barData = null
    checkBarInterval(barStartTS, barLineTS)
      return (barLineTS - barStartTS) < 15
    flush()
      printData()

Worker_3: (WebsocketThread) 
Client subscriptions come here. Maintains
client list, and publishes the BAR OHLC data as computed in real time.
//Not implemented

Test Cases:
//Not implemented



Output
Prints the OHLC "ONLY" when the bar closes

Example: when the bar closed

Server running on http://localhost:3000
Starting the reader for trade symbol:  XXBTZUSD
Printing for index:  1  count:  5
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":1,"o":6538.8,"h":6538.8,"l":6538.8,"c":0,"volume":1}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":1,"o":6538.8,"h":6538.8,"l":6538.2,"c":0,"volume":1.498558}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":1,"o":6538.8,"h":6538.8,"l":6537.9,"c":0,"volume":4.556558}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":1,"o":6538.8,"h":6538.8,"l":6537.7,"c":0,"volume":4.999999}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":1,"o":6538.8,"h":6538.8,"l":6537.7,"c":6537.7,"volume":4.99999942}
Printing for index:  2  count:  4
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":2,"o":6537.7,"h":6537.7,"l":6537.7,"c":0,"volume":0.556558}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":2,"o":6537.7,"h":6537.7,"l":6537.6,"c":0,"volume":3.613558}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":2,"o":6537.7,"h":6537.7,"l":6537.4,"c":0,"volume":4.999998}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":2,"o":6537.7,"h":6537.7,"l":6537.4,"c":6537.4,"volume":4.99999842}
Printing for index:  3  count:  5
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":3,"o":6538.2,"h":6538.2,"l":6538.2,"c":0,"volume":0.025}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":3,"o":6538.2,"h":6539.7,"l":6538.2,"c":0,"volume":0.343}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":3,"o":6538.2,"h":6539.7,"l":6538.2,"c":0,"volume":0.36800000000000005}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":3,"o":6538.2,"h":6539.7,"l":6538.2,"c":0,"volume":0.39300000000000007}
{"event":"ohlc_notify","symbol":"XXBTZUSD","bar_num":3,"o":6538.2,"h":6539.7,"l":6538.2,"c":6538.9,"volume":0.4180000000000001}

Note: At the 15 sec boundary, the 'Bar' closes, and a new Bar starts at the next Trade.

