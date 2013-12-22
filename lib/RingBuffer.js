//var obj = require('lib_name');

function RingBuffer(size) {

    this._data = [];
    this._head = -1; // Points to the index of the most recently added element in buffer
    this._tail = -1; // Points to the index of the oldest element in buffer
    if (size < 1)
        throw Error("Cannot create zero or negative sized buffer: " + size);
    this._capacity = size;
    this._lastTrimmed = null;

};

RingBuffer.loadInstance = function (dataObj) {
    var rb = new RingBuffer(1);
    rb._data = dataObj._data;
    rb._head = dataObj._head;
    rb._tail = dataObj._tail;
    rb._capacity = dataObj._capacity;
    return rb;
}

RingBuffer.prototype.toArray = function () {
    return this._data;
}


// Map function, f, on buffer in ring order, from tail to head
// The return value of f is stored back into the buffer in the current element record.
// f is called with current element count and the element itself for the current position.
RingBuffer.prototype.map = function (f) {
    var idx = 0;
    while (idx < this.getCurrentSize()) {
        var element = this.getElementAt(idx);
        this.setElementAt(idx, f(idx, element));
        idx++;
    }
}

// Get element at index, relative to tail (i = 0 -> tail(), i = 1 -> (tailIndex+1)()
RingBuffer.prototype.getElementAt = function (i) {
    if (i > this.getBufferCapacity())
        i %= this.getBufferCapacity();
    var index = this._tail + i;
    if (index < this.getCurrentSize())
        return this._data[index];
    else if (index >= this.getBufferCapacity())
        return this._data[index % this.getBufferCapacity()];
}

// Set element indexed relative to tail position (tail+i)
RingBuffer.prototype.setElementAt = function (i, element) {
    var index = this._tail + i;
    if (index < this.getCurrentSize())
        this._data[index] = element;
    else if (index >= this.getBufferCapacity())
        this._data[index % this.getBufferCapacity()] = element;
}

RingBuffer.prototype.getCurrentSize = function () {
    return this._data.length;
};

RingBuffer.prototype.getBufferCapacity = function () {
    return this._capacity;
};

RingBuffer.prototype.head = function () {
    if (this.getCurrentSize() <= 0)
        return null;
    return this._data[this._head];
};

RingBuffer.prototype.tail = function () {
    if (this.getCurrentSize() <= 0)
        return null;
    return this._data[this._tail];
};

/** As the ringbuffer reaches capacity and starts wrapping around, the oldest element
 * is trimmed off when a new elements are added. This is keeps the ring to a fixed size.
 *
 * This method returns the most recently trimmed element, or null, if the ring is still under capacity (filling up)
 * @returns element
 */
RingBuffer.prototype.getLastTrimmedElement = function () {
    return this._lastTrimmed;
}

RingBuffer.prototype.push = function (element) {
    var size = this._data.push(element);
    if (size > this.getBufferCapacity())         // Need to trim
        this._lastTrimmed = this._data.shift();

    this._head = this.getCurrentSize() - 1;
    this._tail = 0; // only relevant for the first add really

    return this.getCurrentSize();
}

module.exports = RingBuffer;
