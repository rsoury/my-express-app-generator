import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import stylus from 'stylus';
import compression from 'compression';
import lusca from 'lusca';
import Opbeat from 'opbeat';
import routes from './routes/index';
import Database from './config/sql';

const app = express();
app.use(compression());
const port = process.env.PORT || 5550;

//Handle Database
const sql = new Database(app.get('env'));
app.set('sql', sql);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.js is being run from the dist folder.
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600 }));

app.use(session({
  secret: 'IActuallyAmStartingToBelieveThisSecretIsImportant',
  resave: true,
  saveUninitialized: true,
}));

//Configure Lusca Security
app.use(lusca({
  csrf: app.get('env') === 'production',
  csp: {
    policy: {
      'default-src': '* \'self\' \'unsafe-inline\'',
      'img-src': '* \'self\' data:; ',
      'script-src': '* \'self\' \'unsafe-inline\'',
      'style-src': '* \'unsafe-inline\'',
      'font-src': '* \'self\' \'unsafe-inline\' data:;',
    }
  },
  xframe: 'SAMEORIGIN',
  p3p: 'dkwadlkawjkldjalkwdj',
  hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
  xssProtection: true
}));

//Expiry Headers
app.use((req, res, next) => {
  const maxAge = 31557600;
  if (!res.getHeader('Cache-Control')){
    res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));
  }
  next();
});

// Handle robots.txt
app.use((req, res, next) => {
  console.log(req.url);
  if(req.url == '/robots.txt' || req.url == '/robots.txt/'){
    res.type('text/plain');
    res.send(`
      User-Agent: *
      Allow: /
    `);
  }else{
    next();
  }
});

//Routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
app.listen(port, () => {
  console.log('Listening on port: ' + port);
});