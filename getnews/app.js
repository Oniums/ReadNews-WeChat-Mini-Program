var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var schedule = require("node-schedule");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sd = require('silly-datetime');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var sd = require('silly-datetime');
var mysql = require("mysql");
var request = require('request');

const db_config = {
  host: "host",
  user: "user",
  password: "password",
  port: "3306",
  database: "database"
}

function getnews(channel) {
  request({
    url: "url",
    method: "method",
    json: true,
    headers: {
      "content-type": "content-type",
      "Authorization": "Authorization"
    },
  }, function (error, response, request) {
    if (!error && response.statusCode == 200) {
      for (let i = 0; i < request.showapi_res_body.pagebean.contentlist.length; i++) {
        db.query('INSERT INTO news(id, channel, title, content, image, image_list, pubdate, pubtime, havePic, source, link) VALUES(\'' + request.showapi_res_body.pagebean.contentlist[i].id + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].channelName + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].title + '\',\'' + JSON.stringify(request.showapi_res_body.pagebean.contentlist[i].allList).replace(/\\"/g," ") + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].img + '\',\'' + JSON.stringify(request.showapi_res_body.pagebean.contentlist[i].imageurls) + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].pubDate + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].pubDate + '\',' + request.showapi_res_body.pagebean.contentlist[i].havePic + ',\'' + request.showapi_res_body.pagebean.contentlist[i].source + '\',\'' + request.showapi_res_body.pagebean.contentlist[i].link + '\')', function (err, result) {
          if (err){}
        })
      }
    }
  });
}


var db = mysql.createConnection(db_config);
db.connect();

var rule = new schedule.RecurrenceRule();
var times = [0, 8, 12, 16, 20];
rule.hour = times;
rule.minute = 0;
rule.second = 0;
schedule.scheduleJob(rule, function () {
  getnews("5572a109b3cdc86cf39001db");
  getnews("5572a109b3cdc86cf39001de");
  getnews("5572a109b3cdc86cf39001df");
  getnews("5572a109b3cdc86cf39001e0");
  getnews("5572a109b3cdc86cf39001e6");
  getnews("5572a10ab3cdc86cf39001eb");
  getnews("5572a10ab3cdc86cf39001ee");
  getnews("5572a10bb3cdc86cf39001f8");
  console.log('[' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '] 最新新闻已更新')
});
var rule_hot = new schedule.RecurrenceRule();
rule_hot.hour = 20;
rule_hot.minute = 0;
rule_hot.second = 0;
schedule.scheduleJob(rule_hot, function () {
  getnews("5572a108b3cdc86cf39001cd");
  console.log('[' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '] 热点新闻已更新')
});
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});