/**
 * Connect - SQLite3
 * Copyright(c) 2012 David Feinberg
 * MIT Licensed
 * forked from https://github.com/tnantoka/connect-sqlite
 */

/**
 * Module dependencies.
 */
var sqlite3 = require('bun:sqlite'),
    events = require('events');
const Database = sqlite3.Database
/**
 * @type {Integer}  One day in milliseconds.
 */
var oneDay = 86400000;

/**
 * Return the SQLiteStore extending connect's session Store.
 *
 * @param   {object}    connect
 * @return  {Function}
 * @api     public
 */
module.exports = function (connect) {
    /**
     * Connect's Store.
     */
    var Store = (connect.session) ? connect.session.Store : connect.Store;

    /**
     * Remove expired sessions from database.
     * @param   {Object}    store
     * @api     private
     */
    function dbCleanup(store) {
        var now = new Date().getTime();
        store.db.run('DELETE FROM ' + store.table + ' WHERE ? > expired', [now]);
    }

    /**
     * Initialize SQLiteStore with the given options.
     *
     * @param   {Object}    options
     * @api     public
     */
    function SQLiteStore(options) {
        options = options || {};
        Store.call(this, options);

        this.table = options.table || 'sessions';
        this.db = options.db || this.table;
        var dbPath;

        if (this.db.indexOf(':memory:') > -1 || this.db.indexOf('?mode=memory') > -1) {
            dbPath = this.db;
        } else {
            dbPath = (options.dir || '.') + '/' + this.db;
        }

        this.db = new Database(dbPath, options.mode);
        this.client = new events.EventEmitter();
        var self = this;
        try {
            this.db.exec((options.concurrentDb ? 'PRAGMA journal_mode = wal; ' : '') + 'CREATE TABLE IF NOT EXISTS ' + this.table + ' (' + 'sid PRIMARY KEY, ' + 'expired, sess)')
            self.client.emit('connect');
            dbCleanup(self);
            //query the db and see if we can connect.
            setInterval(dbCleanup, oneDay, self).unref();
        } catch (err) {
            throw err;
        }
    }

    /**
     * Inherit from Store.
     */
    SQLiteStore.prototype = Object.create(Store.prototype);
    SQLiteStore.prototype.constructor = SQLiteStore;

    /**
     * Attempt to fetch session by the given sid.
     *
     * @param   {String}    sid
     * @param   {Function}  fn
     * @api     public
     */
    SQLiteStore.prototype.get = function (sid, fn) {
        var now = new Date().getTime();
        try {
            const query = this.db.query('SELECT sess FROM ' + this.table + ' WHERE sid = ? AND ? <= expired')
            const row = query.get([sid, now])
            if (!row) return fn();
            fn(null, JSON.parse(row.sess));
        } catch (err) {
            if (err) fn(err);
        }
    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param   {String}    sid
     * @param   {Session}   sess
     * @param   {Function}  fn
     * @api     public
     */
    SQLiteStore.prototype.set = function (sid, sess, fn) {
        try {
            var maxAge = sess.cookie.maxAge;
            var now = new Date().getTime();
            var expired = maxAge ? now + maxAge : now + oneDay;
            sess = JSON.stringify(sess);

            const query = this.db.query('INSERT OR REPLACE INTO ' + this.table + ' VALUES (?, ?, ?)')
            query.all([sid, expired, sess])

            if (fn) fn.apply(this, arguments);
        } catch (e) {
            if (fn) fn(e);
        }
    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param   {String}    sid
     * @api     public
     */
    SQLiteStore.prototype.destroy = function (sid, fn) {
        this.db.run('DELETE FROM ' + this.table + ' WHERE sid = ?', [sid], fn);
    };

    /**
     * Fetch number of sessions.
     *
     * @param   {Function}  fn
     * @api     public
     */
    SQLiteStore.prototype.length = function (fn) {
        this.db.all('SELECT COUNT(*) AS count FROM ' + this.table + '', function (err, rows) {
            if (err) fn(err);
            fn(null, rows[0].count);
        });
    };

    /**
     * Clear all sessions.
     *
     * @param   {Function}  fn
     * @api     public
     */
    SQLiteStore.prototype.clear = function (fn) {
        try {
            this.db.exec('DELETE FROM ' + this.table + '')
            fn(null, true);
        } catch (err) {
            if (err) fn(err);
        };
    };

    /**
     * Touch the given session object associated with the given session ID.
     *
     * @param   {string}    sid
     * @param   {object}    session
     * @param   {function}  fn
     * @public
     */
    SQLiteStore.prototype.touch = function (sid, session, fn) {
        if (session && session.cookie && session.cookie.expires) {
            var now = new Date().getTime();
            var cookieExpires = new Date(session.cookie.expires).getTime();
            try {
                const query = this.db.query('UPDATE ' + this.table + ' SET expired=? WHERE sid = ? AND ? <= expired')
                query.run([cookieExpires, sid, now])
                if (fn) {
                    fn(null, true);
                }
            } catch (err) {
                if (err) fn(err);
            }
        } else {
            fn(null, true);
        }
    }

    return SQLiteStore;
};