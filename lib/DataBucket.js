var RingBuffer = require('./RingBuffer.js');
var debugLog = false;


/* Sample bucket conf

 {
 capacity: 60, // nr _data points store before aggregation occurs to next bucket
 persistence: 'RAM',
 aggregationStrategy: 'average'
 }

 */

function DataBucket(capacity, strategy) {
    this._storage = new RingBuffer((capacity ? capacity : 60));
    this._capacity = this._storage.getBufferCapacity();
    this._avg = 0.0;
    this._sum = 0.0;
    this._max = 0.0;
    this._min = 0.0;
    this._lastAdded = null;
    this._additionsCount = 0; // nr of times add() was called. At bucket capacity, it will reset and trigger aggregation to next bucket

    this._aggregationStretegy = (strategy ? strategy : 'average');
};

DataBucket.createInstance = function (bucketConf) {
    var b = new DataBucket(bucketConf.capacity,
            bucketConf.aggregationStrategy);
    log("BUCKET: created bucket:" + JSON.stringify(b, null, 4));
    return b;
}

DataBucket.loadInstance = function (dataObj) {
    var b = new DataBucket(dataObj._capacity, dataObj._aggregationStretegy);
    b._avg = dataObj._avg;
    b._sum = dataObj._sum;
    b._max = dataObj._max;
    b._min = dataObj._min;
    b._lastAdded = dataObj._lastAdded;
    b._storage = RingBuffer.loadInstance(dataObj._storage);
    return b;
}


DataBucket.prototype.getData = function () {
    return this._storage.toArray();
};

DataBucket.prototype.lastAdded = function () {
    return this._lastAdded;
};

DataBucket.prototype.getAggregationStrategy = function () {
    return this._aggregationStretegy;
}

DataBucket.prototype.getBufferCapacity = function () {
    return this._capacity;
};

DataBucket.prototype.average = function () {
    return this._avg;
};

DataBucket.prototype.sum = function () {
    return this._sum;
};

DataBucket.prototype.max = function () {
    return this._max;
};

DataBucket.prototype.min = function () {
    return this._min;
};

DataBucket.prototype.aggregate = function () {
    if (this._aggregationStretegy == 'average')
        return this.average();
    else if (this._aggregationStretegy == 'sum')
        return this.sum();
    else if (this._aggregationStretegy == 'max')
        return this.max();
    else if (this._aggregationStretegy == 'min')
        return this.min();

    throw Error("Unsupported aggregation strategy: " + this._aggregationStrategy);


}

DataBucket.prototype.add = function (val, timeStamp) {
    this._lastAdded = [val, timeStamp];

    var oldSum = this._sum;

    var oldTail = (!(this._storage.tail()) ? 0 : (this._storage.tail())[0]);
    var oldTailIndex = this._storage._tail;
    var size = this._storage.push(this._lastAdded);

    if (oldTailIndex == this._storage._tail)
        oldTail = 0; // edge case when filling up. Adjusted here to simplify calculation below

    if (size == 1) {
        this._avg = this._max = this._min = this._sum = val;
        // return size;
    }
    else {

        this._sum = this._sum + val - oldTail;
        this._avg = this._sum / size;

        var idx = 0;
        var swap = this._max;
        this._max = this._min;
        this._min = swap;
        while (idx < this._storage.getCurrentSize()) {
            var element = this._storage.getElementAt(idx);
            if (element[0] > this._max)
                this._max = element[0];
            if (element[0] < this._min)
                this._min = element[0];
            idx++;
        }
    }

    var rollUp = (++this._additionsCount) % this.getBufferCapacity();
    if(rollUp == 0)
        this._additionsCount = 0;
    return (rollUp == 0);
//    return size;
}


// Internal helpers below


var log = function (msg) {
    if (debugLog)
        console.log(msg);
};


module.exports = DataBucket;