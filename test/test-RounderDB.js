var assert = require('assert');
//var rounder = require('./rounder.js');
/*
 From whisper
 To support accurate aggregation from higher to lower resolution archives, the number of points in a longer retention
 archiveName must be divisible by its next lower retention archiveName. For example, an archiveName with 1 _data points every
 60 seconds and retention of 120 points (2 hours worth of _data) can have a lower-resolution archiveName following it with
 a resolution of 1 _data point every 300 seconds for 1200 points
 */

describe('Create archiveName', function () {
    var conf = {
        cpuLoad: [
            {
                _capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
                persistence: 'RAM',
                aggregationStrategy: 'average'
            },
            {
                _capacity: 4,
                persistence: 'RAM'
            }

        ],
        clicks: [
            {
                _capacity: 2, // nr _data points to storage before aggregation occurs to next bucket
                persistence: 'RAM',
                aggregationStrategy: 'sum'
            },
            {
                _capacity: 4,
                persistence: 'RAM'
            }
        ]
    }

    it('should have some prop', function () {
        assert(true);
    });
});

