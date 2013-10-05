var os = require('os');
var path = require('path');
var fs = require('fs');

var Archive = require('./Archive.js');

var debugLog = false;

function RounderDB() {
    this._archives = {};
    this._DBfile = 'NODISK';
    this._syncInterval;
    this._persistenceHandler = null;
    this._intervalHandler = null;
    this._syncActive = false;
}


/** Static factory method to create instances from config.
 *
 * @param config
 * @returns {RounderDB} instance
 */
RounderDB.createInstance = function (config) {
    var rb = new RounderDB();
    for (var archiveName in config) {
        if (!config.hasOwnProperty(archiveName) || archiveName == 'persistenceConf')
            continue;
        log("Rounder:: Creating archive: " + archiveName);
        rb.addArchive(archiveName, Archive.createInstance(config[archiveName]));
    }
    if (config.persistenceConf.dbDir != 'NODISK')
        rb.setDBFile(config.persistenceConf.dbFile);
    rb.setSyncInterval(config.persistenceConf.syncInterval);
    log("ROUNDER instance created: " + JSON.stringify(rb, null, 4));
    return rb;
}


RounderDB.loadInstance = function (dataObj) {
    var rb = new RounderDB();
    rb.setDBFile(dataObj._DBfile);
    rb.setSyncInterval(dataObj._syncInterval);

    for (var n in dataObj._archives) {
        rb.addArchive(n, Archive.loadInstance(dataObj._archives[n]));
    }

    rb.setSync(dataObj._syncActive);
    return rb;

}

RounderDB.saveInstance = function (rDB, callback) {
    var fileName = rDB.getDBFile();
    if (fileName != null && fileName != 'NODISK')
        fs.writeFile(fileName, JSON.stringify(rDB), {encoding: 'utf8'}, callback);
}

/** Add new value to a named archive.
 *
 * @param archiveName
 * @param val
 * @param timeStamp Optional argument. If omitted, server time stamp will be used
 * @returns {*}
 */
RounderDB.prototype.add = function (archiveName, val, timeStamp) {
    if (typeof timeStamp === 'undefined')
        timeStamp = new Date().getTime();
    if (this._archives[archiveName] == null)
        return null;
    return this._archives[archiveName].add(val, timeStamp);

}

/** Set the function which handles persistence to disk
 *
 * @param callback
 */
RounderDB.prototype.setPersistenceHandler = function (callback) {
    this._persistenceHandler = callback;
}

RounderDB.prototype.getPersistenceHandler = function () {
    return this._persistenceHandler;
}

RounderDB.prototype.addArchive = function (name, archiveInstance) {
    this._archives[name] = archiveInstance;
}

RounderDB.prototype.getArchive = function (name) {
    return this._archives[name];
}


/** Clear all in-memory data and remove any files on disk
 *
 */
RounderDB.prototype.reset = function () {
    this._archives = {};
    this.setSync(false);
    if (this._DBfile != 'NODISK')
        fs.unlinkSync(this._DBfile);
    this._DBfile = 'NODISK';
}

RounderDB.prototype.getDBFile = function () {
    return this._DBfile;
}

/** Set the directory in which to store data. Also, sets a default persistence handler.
 * If file == 'TMP', a temporary directory will be created in the OS temp file.
 * If file == 'NODISK', no disk persistence will be used (in-mem only operation)
 * The default value is 'NODISK'.
 *
 * @param file File name to save to
 * @param cb Callback to execute on save (receives err and data)
 */
RounderDB.prototype.setDBFile = function (file, cb) {
    if (file == null)
        return;
    else if (file == 'TMP') {
        var tmpFile = path.join(os.tmpDir(), "rounderDB.json");
        try {
            if (fs.existsSync(tmpFile))
                fs.unlinkSync(tmpFile);
        } catch (err) {
            console.error("RounderDB:setDBFile ERROR creating temp file: " + err);
        }
    } else
        this._DBfile = path.resolve(file);

    this.setPersistenceHandler((function (rDB, callback) {
        return function() {
//            console.log("SAVING to file: "+rDB.getDBFile());
            RounderDB.saveInstance(rDB, callback);
        };
    })(this, cb));
    log("Setting DB file to file: " + this._DBfile);
}

RounderDB.prototype.getNrArchives = function () {
    return Object.keys(this._archives).length;
}

/** Set the sync interval for persisting data to disk.
 *
 * @param interval in seconds. 0 means never (also removed any active job)
 */
RounderDB.prototype.setSyncInterval = function (interval) {
    if (interval < 0)
        interval = 0;
    else if (interval == 0 && this._intervalHandler != null)
        this.setSync(false);
    this._syncInterval = interval;
}

/** If set to true, and interval handler will be scheduled to run
 * each syncInterval to persist data to disk.
 *
 * If 'NODISK' is used, no handler will be started regardless.
 *
 * If set to false, it will remove any interval handler.
 *
 * @param state Set to true or false.
 */
RounderDB.prototype.setSync = function (state) {
    if (state && this._DBfile != 'NODISK') {
        if (this._persistenceHandler == null)
            throw Error("RounderDB:setSync: Cannot schedule persistenceHandler 'null'");
        this._intervalHandler = setInterval(this._persistenceHandler, this._syncInterval*1000);
        this._syncActive = true;
    } else if (this._intervalHandler != null) {
        clearInterval(this._intervalHandler);
        this._syncActive = false;
    }
}


// Internal helpers below


var log = function (msg) {
    if (debugLog)
        console.log(msg);
};

module.exports = RounderDB;