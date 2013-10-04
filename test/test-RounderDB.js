var assert = require('assert');

var RounderDB = require('../RounderDB.js');
var Archive = require('../lib/Archive.js');
var DataBucket = require('../lib/DataBucket.js');


describe('RounderDB', function () {
    var conf = require('./fixtures/testConf.json');

    it('Constructor parses basic conf', function () {
        var rb = RounderDB.createInstance(conf);
        assert(rb.getArchive('cpuLoad') instanceof Archive, "Archive not instance of Archive. Returned: " + JSON.stringify(rb.getArchive('cpuLoad'), null, 4));
        assert(rb.getArchive('clicks') instanceof Archive);
        assert(rb.getArchive('cpuLoad').getBucket(0) instanceof DataBucket, "getBucket() did not return instance of DataBucket. Returned: " + rb.getArchive('cpuLoad').getBucket(0));
        assert(rb.getArchive('cpuLoad').getNrBuckets() == 2);
        assert(rb.getArchive('clicks').getNrBuckets() == 2);
    });

    it('add() adds values', function () {
        var rb = RounderDB.createInstance(conf);
        rb.add('cpuLoad', 1.2);
        rb.add('cpuLoad', 1.3);

        assert(rb.getArchive('cpuLoad').getDataForBucket(0).length == 2);
    });

    it('addArchive adds archives', function () {
        var rb = new RounderDB();
        var archive = new Archive();
        archive.addBucket(new DataBucket(2, 'average'));
        rb.addArchive('cpuLoad', archive);

        assert(rb.getArchive('cpuLoad') instanceof Archive);
        assert(rb.getNrArchives() == 1, "Expected 1, but the number of archives are: "+rb.getNrArchives());
    });

});

