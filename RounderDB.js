var fs = require('fs');
var Archive = require('./lib/Archive.js');

var debugLog = true;

// Factory function
function RounderDB(config) {

    this._archives = {};
    for (archiveName in config) {
        if (!config.hasOwnProperty(archiveName))
            continue; // maybe stupid in this context, but adds robustness
        console.log("Rounder:: Creating archive: " + archiveName);
        this._archives[archiveName] = new Archive(config[archiveName]);
    }

}

RounderDB.prototype.add = function(archiveName, val, timeStamp) {
    if (typeof timeStamp === 'undefined')
        timeStamp = new Date().getTime();
    if(this._archives[archiveName] == null)
        return null;
    return this._archives[archiveName].add(val, timeStamp);

}

RounderDB.prototype.getArchive = function(name) {
    return this._archives[name];
}


RounderDB.prototype.getNrArchives = function() {
    return this._archives.length;
}

RounderDB.prototype.getData = function(archiveName) {
    throw Error("Not yet implemented");
}


// Internal helpers below




var log = function (msg) {
    if (debugLog)
        console.log(msg);
};

module.exports = RounderDB;