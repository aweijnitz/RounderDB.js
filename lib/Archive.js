var DataBucket = require('./DataBucket.js');
var debugLog = false;


/* Sample conf for an archive
 [
 {
 capacity: 60, // nr _data points to storage before aggregation occurs to next bucket
 persistence: 'RAM',
 aggregationStrategy: 'average'
 },
 {
 capacity: 2*60,
 persistence: 'file',
 persistenceParams: { path: '/var/log/rounderDB/_data/cpuLoad.dat' },
 aggregationStrategy: 'average'
 }
 ]
 */

/** Constructor.
 * The only argument is optional. It is a convenience param to quickly create an array of buckets.
 * Capacity 60, RAM persistence and 'average' aggregation strategy used as defaults.
 *
 * @param nrBuckets Optional init argument
 * @constructor
 */
function Archive(nrBuckets) {
    this._buckets = [];

    if (!(nrBuckets === undefined) && nrBuckets > 0) {
        for (var i = 0; i < nrBuckets; i++)
            this._buckets.push(new DataBucket(60, 'average'));
    }
}


Archive.createInstance = function (archiveConf) {
    log("ARCHIVE creating from conf: " + JSON.stringify(archiveConf, null, 4));
    var a = new Archive();
    for (var bucket in archiveConf) {
        a.addBucket(DataBucket.createInstance(archiveConf[bucket]));
    }
    log("ARCHIVE: created archive: " + JSON.stringify(a, null, 4));
    return a;
}


Archive.loadInstance = function (dataObj) {
    var a = new Archive();
    dataObj._buckets.map(function (b) {
        a.addBucket(DataBucket.loadInstance(b));
    });
    return a;
}


Archive.prototype.getDataForBucket = function (index) {
    return this._buckets[index].getData();
};

Archive.prototype.add = function (val, timeStamp) {
    if (this._buckets.length == 0)
        throw Error("No buckets available for storage!");

    var rollUp = this._buckets[0].add(val, timeStamp);
    if (rollUp && this._buckets.length > 1)
        for (var i = 1; i < this._buckets.length && rollUp; i++)
            rollUp = this._buckets[i].add(this._buckets[i-1].aggregate(), timeStamp);


    /*
     this._buckets.map(function(bucket, index, buckets) {
     if(index == 0)
     bucket.add(val, timeStamp);
     else if(index >= 1 && rollUp)
     bucket.add(buckets[index-1].aggregate(), timeStamp);

     });
     */

};


Archive.prototype.addBucket = function (bucket) {
    if (!(bucket instanceof DataBucket))
        throw Error("Can only add instances of DataBucket. Got: " + bucket);
    this._buckets.push(bucket);
}

Archive.prototype.getValues = function (bucketIndex) {
    return buckets[bucketIndex].storage.values();
}

Archive.prototype.getNrBuckets = function () {
    return this._buckets.length;
}

Archive.prototype.getBucket = function (index) {
    return this._buckets[index];
}


// Internal helpers below


var log = function (msg) {
    if (debugLog)
        console.log(msg);
};


module.exports = Archive;
