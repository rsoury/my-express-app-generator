'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _string = require('string');

var _string2 = _interopRequireDefault(_string);

var _redis = require('./redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Database(env) {
        _classCallCheck(this, Database);

        this.POOL = _mysql2.default.createPool(env === 'development' ? this.devDB() : this.prodDB());
        this.REDIS = new _redis2.default();
        this.TESTING = env === 'production' ? false : false; //false;
    }

    _createClass(Database, [{
        key: 'query',
        value: function query(_query, variables, callback) {
            var _this = this;

            if (typeof variables == 'function') {
                callback = variables;
                variables = '';
            }
            variables = variables || '';
            var pre_query = new Date().getTime();
            //When we are testing we are going to run both queries and compare them to see how often they return the same results.
            //Should be 100% of the time.
            this.REDIS.getCache(_query, _mysql2.default.format(_query, variables), function (result) {
                if (_this.TESTING ? true : result == -1) {
                    _this.POOL.getConnection(function (err, connection) {
                        if (err) {
                            if (connection != undefined) {
                                connection.release();
                                connection.destroy();
                            }
                            console.log("code : 100, status : Error in connection database, err : " + err);
                            return -99;
                        }
                        connection.on('error', function (err) {
                            connection.release();
                            connection.destroy();
                            console.log("code : 101, status : Error in connection database, err : " + err);
                            return -99;
                        });
                        connection.query(_query, variables, function (err, rows) {
                            connection.release();
                            connection.destroy();
                            if (_this.TESTING) {
                                if (result != -1) {
                                    var RedisErr = result.err;
                                    var RedisRows = result.rows;

                                    console.log(RedisRows);
                                    console.log(rows);
                                } else {
                                    _this.REDIS.setCache({ query: _query, formatted: _mysql2.default.format(_query, variables), err: err, rows: rows });
                                }
                            } else {
                                _this.REDIS.setCache({ query: _query, formatted: _mysql2.default.format(_query, variables), err: err, rows: rows });
                            }
                            if (err) {
                                console.log(err);
                            }
                            var post_query = new Date().getTime();
                            var duration = (post_query - pre_query) / 1000;
                            console.log(_mysql2.default.format(_query, variables).green + '   ' + (duration + '').yellow);
                            if (callback) {
                                callback(err, rows);
                            }
                        });
                    });
                } else {
                    var err = result.err;
                    var rows = result.rows;

                    var post_query = new Date().getTime();
                    var duration = (post_query - pre_query) / 1000;
                    console.log(_mysql2.default.format(_query, variables).red + "    Redis: " + (duration + '').yellow);
                    if (callback) {
                        callback(err, rows);
                    }
                }
            });
        }
    }, {
        key: 'format',
        value: function format(a, b) {
            return _mysql2.default.format(a, b);
        }
    }, {
        key: 'devDB',
        value: function devDB() {
            return {
                connectionLimit: 20,
                host: "localhost",
                user: "root",
                password: "sesgidvu",
                database: "shompass"
            };
        }
    }, {
        key: 'prodDB',
        value: function prodDB() {
            return {
                connectionLimit: 20,
                host: "shpmpass.com",
                user: "myuser",
                password: "Sesgidvu1!",
                database: "shompass"
            };
        }
    }, {
        key: 'log',
        value: function log(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    console.log(key.blue);
                    console.log(obj[key]);
                }
            }
        }
    }]);

    return Database;
}();
//# sourceMappingURL=sql.js.map
