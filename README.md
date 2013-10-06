
# RounderDB.js
## A low-I/O, fixed size, round robin db with in-mem support. Stores in RAM and syncs periodically to disk.

Build status: [![Build Status](https://travis-ci.org/aweijnitz/RounderDB.js.png)](https://travis-ci.org/aweijnitz/RounderDB.js)

## Description
RounderDB is a data logger. Each log, like for example CPU load reading, is called an *archive*. An *archive* keeps a number of *buckets* to store data in. The first bucket receives the added data points and data is then *aggregated up* to the remaining buckets in a chain, first -> second -> third bucket, etc. The aggregation method is configurable, and support is included for average, min, max and sum. 

Each bucket is a fixed-size ring buffer of size N, where N is a configurable number. Aggregation up the chain occurs when N entries have been added to the a buffer, so going "full circle" triggers buffer aggregation.

Data is stored as tuples `[<val>, <timestamp>]`. The timestamp is either set explicitly when adding points, or will be added automatically. Out-of-sequence adding is currently not supported. 

## Installation
Either clone this repository, or in your project folder, do

	npm install rounderdb

## Usage
The intended use for RounderDB is to be embedded in a host application, like a server monitoring program, so the way to use it is something like this:

1. Create an instance of RounderDB (explicitly, or from config in a file)

2. Add a couple of Archives, each with a couple of DataBuckets (you don't need to worry about this step if you do the config file)

3. Add data to archives as it comes in, either with explicit time stamps, or using the default (timestamp created by RounderDB from server time).

See the file `./test/test-RounderDB.js` and the example config file in `./test/fixutures/testConfig.persist.json` to get an idea about how to use it. Looking in `RounderDB.js` is of course also useful.

## Motivation
I wrote this to serve as the backing part of a small monitoring package I am building to monitor the status a Raspberry Pi. I am running the Pi as a headless server and need to monitor server status without too much impact on the other processes. 

IO is really slow in the Raspberry Pi and after realizing that the RRDTOOL-based program I had downloaded took so much IO and CPU, that it was the major contribution to some monitoring graphs, I decided to build something that trades risk of data loss for reduced IO and CPU needs. 

To achieve the goal of reduced IO I need a datastore that doesn't store so frequently. On the Pi, especially when storing on the SD card, it is better to write a large file infrequently, than writing a small amounts of data frequently and this is exactly what the RounderDB does; It will keep data archives in memory and store all archives in one go at regular intervals. Data that has not been stored is of course lost, but considering that the intended use is monitoring of server status, infrequent loss of some data points is acceptable.


## Running the tests
**Unit tests:** 

	npm test

**Integration tests** 

	mocha -R spec ./test/integration/*js

*If you don't a have Mocha installed, it's included as a dev dependency, so instead you can run*

	./node_modules/mocha/bin/mocha -R spec ./test/

and

	./node_modules/mocha/bin/mocha -R spec ./test/integration/*js


## Known issues
The major "issue", is probably the inefficient storage format (JSON serialization of the whole object structure to disk). As long as you have limited data amounts, this should not be a problem, but it could become one with large data sets. At that point, switching to something like RRDTOOL, Ganglia, Nagios, Graphite or Munin is probably a good thing. RounderDB is not an enterprise application.

Adding support for out of sequence messages would probably be a good thing, but since I currently don't need it, I haven't implemented it.

There are no known bugs at this point. Please let me know if you find one, or even better: Fork, fix it and send me a pull request (including a test of course ;-).
