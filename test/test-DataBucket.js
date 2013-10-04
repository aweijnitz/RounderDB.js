var assert = require('assert');
var DataBucket = require('../lib/DataBucket.js');

describe('DataBucket basics: ', function () {
    var conf = {
        capacity: 4, // nr _data points to storage before aggregation occurs to next bucket
        aggregationStrategy: 'average'
    };

    it('Constructor parses conf', function () {
        var b = DataBucket.createInstance(conf);
        assert(b.getBufferCapacity() == 4);
    });

    it('add() stores values', function () {
        var b = DataBucket.createInstance(conf);
        b.add(1, 1234);
        assert(b.lastAdded()[0] = 1);
    });

    it('Average, max, min and sum correct for only one data point', function () {
        var b = DataBucket.createInstance(conf);
        b.add(3, 12324);
        assert(b.average() == 3, "Average fail: "+ b.average());
        assert(b.max() == 3, "Max fail: "+ b.max());
        assert(b.min() == 3, "Min fail: "+ b.min());
        assert(b.sum() == 3, "Sum fail: "+ b.sum());

    });


    it('Keeps moving average, max, min and sum when filling up', function () {
        var b = DataBucket.createInstance(conf);
        b.add(1, 12324);
        b.add(2, 12324);
        b.add(3, 12324);

        assert(b.average() == 2, "Average fail: "+ b.average());
        assert(b.max() == 3, "Max fail: "+ b.max());
        assert(b.min() == 1, "Min fail: "+ b.min());
        assert(b.sum() == 6, "Sum fail: "+ b.sum());

    });

    it('Keeps moving average, max, min and sum after wrap-around', function () {
        var b = DataBucket.createInstance(conf);
        // capacity is 4 (see test conf above). Add five values to wrap buffer around.
        b.add(1, 12324);
        b.add(2, 12324); // tail
        b.add(3, 12324);
        b.add(4, 12324);
        b.add(5, 12324); // head

        assert(b.average() == (2+3+4+5)/4, "Average fail. Expected 3.5. Got:  "+ b.average());
        assert(b._storage.getElementAt(0)[0] == 2, "Get element at index points to wrong element: "+b._storage.getElementAt(0));
        assert(b.sum() == 14, "Sum fail: "+ b.sum()); // sum of last 4 elements: 2+3+4+5
        assert(b.max() == 5, "Max fail: "+ b.max());
        assert(b.min() == 2, "Min fail: "+ b.min());

    });



    it('Aggregates according to chosen strategy "average" ', function () {
        var b = DataBucket.createInstance(conf);
        b.add(0, 12324);
        b.add(3, 12324);
        assert(b.aggregate() == 1.5, "Aggregation failed. Expected 1.5. Got "+ b.aggregate());
    });

    it('Aggregates according to chosen strategy "max" ', function () {
        var confMax = {
            capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
            persistence: 'RAM',
            aggregationStrategy: 'max'
        };

        var b = DataBucket.createInstance(confMax);
        b.add(0, 12324);
        b.add(5, 12324);
        b.add(3, 12325);

        assert(b.aggregate() == 5, "Aggregation failed. Expected 5. Got "+ b.aggregate());
    });

    it('Aggregates according to chosen strategy "min" ', function () {
        var confMax = {
            capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
            persistence: 'RAM',
            aggregationStrategy: 'min'
        };

        var b = DataBucket.createInstance(confMax);
        b.add(0, 12324);
        b.add(5, 12324); // tail
        b.add(3, 12325); // head

        assert(b.aggregate() == 3, "Aggregation failed. Expected 3. Got "+ b.aggregate());
        assert(b._storage.tail()[0] == 5, "tail is not 5. it is: "+b._storage.tail());
        assert(b._storage.head()[0] == 3);

    });


    it('Aggregates according to chosen strategy "sum" ', function () {
        var confMax = {
            capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
            persistence: 'RAM',
            aggregationStrategy: 'sum'
        };

        var b = DataBucket.createInstance(confMax);
        b.add(0, 12324);
        b.add(5, 12324);
        b.add(3, 12325);

        assert(b.aggregate() == 8, "Aggregation failed. Expected 8. Got "+ b.aggregate());
        assert(b._storage.tail()[0] == 5);
        assert(b._storage.head()[0] == 3);

    });



});