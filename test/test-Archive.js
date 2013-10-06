var assert = require('assert');
var Archive = require('../lib/Archive.js');
var DataBucket = require('../lib/DataBucket.js');

describe('Archive basics', function () {
    var conf = [
        {
            capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
            aggregationStrategy: 'average'
        },
        {
            capacity: 2,
            aggregationStrategy: 'average'
        },
        {
            capacity: 4,
            aggregationStrategy: 'average'
        }
    ];

    it('Empty argument to createInstance() creates empty instance ', function () {
        var a = Archive.createInstance();
        assert(a instanceof Archive, "a not an instance of Archive");
        assert(a.getNrBuckets() == 0);
    });

    it('Empty Constructor creates empty instance ', function () {
        var a = new Archive();
        assert(a instanceof Archive, "a not an instance of Archive. a: "+JSON.stringify(a, null, 4));
        assert(a.getNrBuckets() == 0);
    });

    it('Constructor with argument 10 creates 10 bucket instance ', function () {
        var a = new Archive(10);
        assert(a instanceof Archive, "a not an instance of Archive");
        assert(a.getNrBuckets() == 10);
        assert(a.getBucket(0).getAggregationStrategy());
    });


    it('Factory function parses conf, creates valid instance', function () {
        var a = Archive.createInstance(conf);
        assert(a instanceof Archive, "a not instance of Archive");
        assert(a.getNrBuckets() == 3);
        assert(a.getBucket(0) instanceof DataBucket);
        assert(a.getBucket(1) instanceof DataBucket);
        assert(a.getBucket(2) instanceof DataBucket);

    });


    it('add() stores values', function () {
        var a = Archive.createInstance(conf);
        assert(a.getNrBuckets() == 3);
        assert(a.getBucket(0) instanceof DataBucket);
        assert(a.getBucket(0).lastAdded() == null);
        a.add(1, 1234);
        assert(a.getBucket(0) instanceof DataBucket);
        assert(a.getBucket(0).lastAdded()[0] == 1);
    });

    it('getDataForBucket() returns array of data', function () {
        var a = Archive.createInstance(conf);
        var timeStamp = 1234;
        var val = 1.2;
        a.add(val, timeStamp);
        var arr = a.getDataForBucket(0);
        assert(arr instanceof Array);
        assert(arr[0] instanceof Array);
        assert(arr.length = 1);
        assert(arr[0][0] = val);
        assert(arr[0][1] = timeStamp);
    });

    it('Aggregation strategy "average"', function () {
        var a = Archive.createInstance(conf);
        a.add(1, 1234);
        a.add(2, 1235);
        a.add(3, 1235); // this will trigger the rollUp
        assert(a.getBucket(1).lastAdded()[0] == 1.5, "Expected 1.5, got: "+a.getBucket(1).lastAdded()[0]);

    });

    it('Aggregation strategy "average", ripple rollUp', function () {
        var a = Archive.createInstance(conf);
        a.add(1, 1234);
        a.add(2, 1235); // aggregate
        a.add(3, 1236);
        a.add(4, 1237); // aggregate
        a.add(5, 1238);
//        console.log(JSON.stringify(a, null, 4));
        assert(a.getBucket(1).lastAdded()[0] == 3.5, "a.getBucket(1).lastAdded: "+a.getBucket(1).lastAdded()[0]);
        assert(a.getBucket(2).lastAdded()[0] == 2.5, "a.getBucket(1).lastAdded: "+a.getBucket(2).lastAdded()[0]);

    });


});
