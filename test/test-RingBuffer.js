var assert = require('assert');

var RingBuffer = require('../lib/RingBuffer.js');

describe('RingBuffer', function () {

    it('Buffer head() should return null when buffer empty', function () {
        assert(null == (new RingBuffer(1)).head());

    });

    it('Buffer tail() should return null when buffer empty', function () {
        assert(null == (new RingBuffer(1)).tail());
    });

    it('Buffer size should be equal to the number of added elements when filling up', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var size = buf.push("a");
        size = buf.push("b");
        assert(2 == buf.getCurrentSize());

    });

    it('Buffer should have smaller size than capacity when filling up', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var size = buf.push("a");
        assert(capacity > size);

    });

    it('Buffer should have same size and capacity after filling up', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var size = buf.push("a");
        buf.push("b");
        buf.push("c");
        size = buf.push("d");
        assert(capacity == size, "Capacity is not equal to size, although it should be! Size: "+size);
        assert(capacity == buf.getCurrentSize());

    });

    it('Buffer should return the same element for head and tail when only one element in buffer', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var size = buf.push("a");
        assert.strictEqual(buf.head(), buf.tail());
    });

    it('Buffer should return correct head element after wrapping around', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var head = "d"
        buf.push("a");
        buf.push("b");
        buf.push("c");
        buf.push(head);
        assert.strictEqual(buf.head(), head, "Head returns the wrong element");
    });

    it('Buffer should return correct tail element after wrapping around', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        var tail = "b"
        buf.push("a"); // will be overwritten due to wrap around
        buf.push(tail);
        buf.push("c");
        buf.push("d");
        assert.strictEqual(tail, buf.tail(), "Tail returns the wrong element");
    });

    it('Buffer getElementAt(i) should return the element relative to tail index', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        buf.push(1);
        buf.push(2);
        buf.push(3);
        buf.push(4);
        assert(buf.tail() == buf.getElementAt(0));
        assert(buf.head() == buf.getElementAt(capacity-1));
        assert(3 == buf.getElementAt(1));
    });

    it('Buffer setElementAt(i,e) should set the element relative to tail index', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        buf.push(1);
        buf.push(2);
        buf.push(3);
        buf.push(4);
        buf.setElementAt(0,5);
        buf.setElementAt(capacity-1,6);
        assert(buf.head() == 6);
        assert(buf.tail() == 5);
    });

    it('Buffer should map() function and update the buffer', function () {
        var capacity = 3;
        var buf = new RingBuffer(capacity);
        buf.push(1); // will be overwritten due to wrap around
        buf.push(2);
        buf.push(3);
        buf.push(4)
        buf.map(function(index, element) { return element+1; });

        assert(buf.head() == 5, "Buffer map did not add 1 to head as expected");
    });

    it('Buffer should map() function and update the buffer on size 1 buffer', function () {
        var capacity = 1;
        var buf = new RingBuffer(capacity);
        buf.push(1);
        buf.map(function(index, element) { return element+1; });

        assert(buf.head() == 2, "Buffer map did not add 1 to head as expected");
    });


    it('getElementAt(i) works with wrap-around', function () {
        var capacity = 4;
        var buf = new RingBuffer(capacity);
        buf.push(1);
        buf.push(2); // tail
        buf.push(3);
        buf.push(4);
        buf.push(5); // head

        assert(buf.tail() == 2, "Tail not correct");
        assert(buf.head() == 5, "Head not correct");
        assert(buf.getElementAt(0) == 2, "getElement index not correct");
        assert(buf.getElementAt(3) == 5, "getElement index not correct");
        assert(buf.getElementAt(2) == 4, "getElement index not correct");

    });

    it('iterating works with wrap-around', function () {
        var capacity = 4;
        var buf = new RingBuffer(capacity);
        buf.push(1);
        buf.push(2);
        buf.push(3); // tail
        buf.push(4);
        buf.push(5);
        buf.push(6); // head

        var i = 0;
        var sum = 0;
        var max = -1;
        while(i < buf.getCurrentSize()) {
            sum += buf.getElementAt(i);
            if(max < buf.getElementAt(i))
                max = buf.getElementAt(i);
            i++;
        }

        assert(sum == (3+4+5+6), "sum not correct");
        assert(max == 6, "max not correct");

    });

    it("getLastTrimmed() returns null when buffer is filling up", function() {
        var buf = new RingBuffer(2);
        buf.push("a");
        assert(buf.getLastTrimmedElement() == null, "Didn't get null as expected. Got: "+buf.getLastTrimmedElement());
    });

    it("getLastTrimmed() returns last trimmed off value when buffer is at capacity", function() {
        var buf = new RingBuffer(2);
        buf.push("a");
        buf.push("b");
        buf.push("c");

        assert(buf.getLastTrimmedElement() == "a", "Didn't get 'a' as expected. Got: "+buf.getLastTrimmedElement());
    });



});