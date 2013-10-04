//var obj = require('lib_name');

function RingBuffer(size) {

    this._data = [];
    this._head = -1; // Points to the index of the most recently added element in buffer
    this._tail = -1; // Points to the index of the oldest element in buffer
    if (size < 1)
        throw Error("Cannot create zero or negative sized buffer: " + size);
    this._capacity = size;

};

RingBuffer.loadInstance = function(dataObj) {
    var rb = new RingBuffer(1);
    rb._data = dataObj._data;
    rb._head = dataObj._head;
    rb._tail = dataObj._tail;
    rb._capacity = dataObj._capacity;
    return rb;
}

RingBuffer.prototype.toArray = function() {
    return this._data;
}


// Map function, f, on buffer in ring order, from tail to head
// The return value of f is stored back into the buffer in the current element record.
// f is called with current element count and the element itself for the current position.
RingBuffer.prototype.map = function(f) {
    var idx = 0;
    while(idx < this.getCurrentSize()) {
        var element = this.getElementAt(idx);
        this.setElementAt(idx, f(idx, element));
        idx++;
    }
}

// Get element at index, relative to tail (i = 0 -> tail(), i = 1 -> (tailIndex+1)()
RingBuffer.prototype.getElementAt = function(i) {
    if(i > this.getBufferCapacity())
        i %= this.getBufferCapacity();
    var index = this._tail + i;
    if(index < this.getCurrentSize())
        return this._data[index];
    else if(index >= this.getBufferCapacity())
        return this._data[index % this.getBufferCapacity()];
}

// Set element indexed relative to tail position (tail+i)
RingBuffer.prototype.setElementAt = function(i, element) {
    var index = this._tail + i;
    if(index < this.getCurrentSize())
        this._data[index] = element;
    else if(index >= this.getBufferCapacity())
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

RingBuffer.prototype.push = function (element) {

    // Ring before wraparound (still filling up to _capacity)
    if (this.getCurrentSize() < this.getBufferCapacity()) {
        this._head = this._data.push(element) - 1;
        if (this._tail < 0)
            this._tail = this._head;
        //console.log("HEAD: " + this._head + ", TAIL: " + this._tail + ", DATA:" + JSON.stringify(this._data));

    } else { // Ring is at _capacity and pointers wraps around
        this._head++;
        this._head %= this._capacity;
        this._tail++;
        this._tail %= this._capacity;
        this._data[this._head] = element;
        //console.log("HEAD: " + this._head + ", TAIL: " + this._tail + ", DATA:" + JSON.stringify(this._data));
    }
    return this.getCurrentSize();
};


/*
 return {
 getCurrentSize: function () {
 return _data.length;
 },
 getBufferCapacity: function () {
 return _capacity;
 },
 _head: function () {
 if (getCurrentSize() <= 0)
 return null;
 return _data[_head];
 },
 _tail: function () {
 if (getCurrentSize() <= 0)
 return null;
 return _data[_tail];
 },
 push: function (element) {

 // Ring before wraparound (still filling up to _capacity)
 if (_head < _capacity) {
 _head = _data.push(element) - 1;
 if (_tail < 0)
 _tail = _head;
 } else { // Ring is at _capacity and pointers wraps around
 _head++;
 _head %= _capacity;
 _tail++;
 _tail %= _capacity;
 _data[_head] = element;
 }
 return getCurrentSize();
 }
 };

 */

module.exports = RingBuffer;