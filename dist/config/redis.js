'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _string = require('string');

var _string2 = _interopRequireDefault(_string);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Redis() {
        var _this = this;

        _classCallCheck(this, Redis);

        var port = void 0,
            host = void 0;
        this.PORT = port = '6379';
        this.HOST = host = '127.0.0.1';
        var client = _redis2.default.createClient(port, host);
        client.on('connect', function () {
            console.log('Redis connected on: ' + host + ':' + port);
            _this.CLIENT = client;
        });
    }

    _createClass(Redis, [{
        key: 'getClient',
        value: function getClient() {
            return this.CLIENT;
        }
    }, {
        key: 'keyQuery',
        value: function keyQuery(query) {
            query = (0, _string2.default)(query).replaceAll('`', '').s;
        }
    }, {
        key: 'setCache',
        value: function setCache(_ref) {
            var query = _ref.query;
            var formatted = _ref.formatted;
            var err = _ref.err;
            var rows = _ref.rows;

            var rc = this.CLIENT;
        }
    }, {
        key: 'getCache',
        value: function getCache(query, formatted, done) {
            var rc = this.CLIENT;
            done(-1);
        }
    }]);

    return Redis;
}();
//# sourceMappingURL=redis.js.map
