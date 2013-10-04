var assert = require('assert');
var fs = require('fs');

var RounderDB = require('../../RounderDB.js');
var Archive = require('../../lib/Archive.js');


describe('RounderDB: Integration test', function () {
    var conf = require('../fixtures/testConf.persist.json');


    it('Save file is created when instance saved.', function (done) {
        var rb = RounderDB.createInstance(conf);
        rb.add('cpuLoad', 1.2);
        rb.add('cpuLoad', 1.3);
        rb.add('clicks', 1);
        rb.add('clicks', 3);

        if (fs.existsSync(rb.getDBFile()))
            fs.unlinkSync(rb.getDBFile()); // some old junk lingering. Cleanup.

        RounderDB.saveInstance(rb, function (err, data) {
            fs.exists(rb.getDBFile(), function (exists) {
                assert(exists, "FILE DOES NOT EXIST: " + rb.getDBFile());
                fs.unlinkSync(rb.getDBFile());
                done();
            });
        });
    });

    it('Saved file can be used to re-create an instance.', function (done) {

        var rb = RounderDB.createInstance(conf);
        rb.add('cpuLoad', 1.2);
        rb.add('cpuLoad', 1.3);
        rb.add('clicks', 1);
        rb.add('clicks', 3);

        if (fs.existsSync(rb.getDBFile()))
            fs.unlinkSync(rb.getDBFile()); // some old junk lingering. Cleanup.

        RounderDB.saveInstance(rb, function (err, data) {
            fs.exists(rb.getDBFile(), function (exists) {
                assert(exists, "FILE DOES NOT EXIST: " + rb.getDBFile());
                fs.readFile(rb.getDBFile(), {encoding: 'utf8'}, function(err, data) {
                    var obj = JSON.parse(data);
                    var rbCopy = RounderDB.loadInstance(obj);
                    assert(rbCopy.getNrArchives() == 2, "Nr archives doesn't match! Got: "+rbCopy.getNrArchives());
                    assert(rbCopy.getArchive('cpuLoad') != null);
                    assert(rbCopy.getArchive('clicks') != null);
                    assert(rbCopy.getArchive('clicks').getDataForBucket(0)[0][0] == 1);
                    fs.unlinkSync(rb.getDBFile());
                    done();
                });
            });
        });
    });

    it('File saved at configured interval.', function (done) {
        var rb = RounderDB.createInstance(conf);
        rb.add('cpuLoad', 1.2);
        rb.add('cpuLoad', 1.3);
        rb.add('clicks', 1);
        rb.add('clicks', 3);

        if (fs.existsSync(rb.getDBFile()))
            fs.unlinkSync(rb.getDBFile()); // some old junk lingering. Cleanup.

        rb.setSyncInterval(1); // every second
        rb.setSync(true); // start

        // Primitive way to wait for the first sync, but, ok for now.
        setTimeout(function() {
            fs.exists(rb.getDBFile(), function (exists) {
                assert(exists, "FILE DOES NOT EXIST: " + rb.getDBFile());
                rb.reset();
                done();
            });
        }, 1300);
    });

});

