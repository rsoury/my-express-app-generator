'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _lusca = require('lusca');

var _lusca2 = _interopRequireDefault(_lusca);

var _opbeat = require('opbeat');

var _opbeat2 = _interopRequireDefault(_opbeat);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

var _sql = require('./config/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
app.use((0, _compression2.default)());
var port = process.env.PORT || 5550;

//Handle Database
var sql = new _sql2.default(app.get('env'));
app.set('sql', sql);

// view engine setup
app.set('views', _path2.default.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.js is being run from the dist folder.
app.use((0, _serveFavicon2.default)(_path2.default.join(__dirname, 'favicon.ico')));
app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json({ limit: '50mb' }));
app.use(_bodyParser2.default.urlencoded({ extended: false, limit: '50mb' }));
app.use((0, _cookieParser2.default)());
app.use(require('stylus').middleware(_path2.default.join(__dirname, 'public')));
app.use(_express2.default.static(_path2.default.join(__dirname, 'public'), { maxAge: 31557600 }));

app.use((0, _expressSession2.default)({
  secret: 'IActuallyAmStartingToBelieveThisSecretIsImportant',
  resave: true,
  saveUninitialized: true
}));

//Configure Lusca Security
app.use((0, _lusca2.default)({
  csrf: app.get('env') === 'production',
  csp: {
    policy: {
      'default-src': '* \'self\' \'unsafe-inline\'',
      'img-src': '* \'self\' data:; ',
      'script-src': '* \'self\' \'unsafe-inline\'',
      'style-src': '* \'unsafe-inline\'',
      'font-src': '* \'self\' \'unsafe-inline\' data:;'
    }
  },
  xframe: 'SAMEORIGIN',
  p3p: 'dkwadlkawjkldjalkwdj',
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xssProtection: true
}));

//Expiry Headers
app.use(function (req, res, next) {
  var maxAge = 31557600;
  if (!res.getHeader('Cache-Control')) {
    res.setHeader('Cache-Control', 'public, max-age=' + maxAge / 1000);
  }
  next();
});

// Handle robots.txt
app.use(function (req, res, next) {
  console.log(req.url);
  if (req.url == '/robots.txt' || req.url == '/robots.txt/') {
    res.type('text/plain');
    res.send('\n      User-Agent: *\n      Allow: /\n    ');
  } else {
    next();
  }
});

//Routes
app.use('/', _index2.default);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
app.listen(port, function () {
  console.log('Listening on port: ' + port);
});
//# sourceMappingURL=app.js.map
