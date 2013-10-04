var should = require('should');

describe('Feature. Ex. Create new user', function () {
    var val;

    before(function (done) {
        Some.call(InParam, function (err, data) {
            val = data;
            done();
        });
    });

    it('should have some prop', function () {
        val.should.have.property('prop', 'expectedVal');
    });

    // ... etc.
});