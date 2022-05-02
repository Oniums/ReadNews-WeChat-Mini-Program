var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require("mysql");
var request = require("request");
var sd = require('silly-datetime');
const crypto = require('crypto');
const WXBizDataCrypt = require('./WXBizDataCrypt')

// view engine setup
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var indexRouter = require('./routes/index');
const { match } = require('assert');
const { time } = require('console');
app.use('/', indexRouter);

function matchTime(time) {
  let ptime = new Date(time).getTime()

  const twentyFourHours = 24 * 60 * 60 * 1000;
  const fortyEightHours = 24 * 60 * 60 * 1000 * 2;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const today = `${year}-${month}-${day}`;
  const todayTime = new Date(today).getTime() - 8 * 60 * 60 * 1000;
  const yesterdayTime = new Date(todayTime - twentyFourHours).getTime();
  const lastYesterdayTime = new Date(todayTime - fortyEightHours).getTime();
  const nowTime = new Date().getTime();
  const result = parseInt((nowTime - ptime) / 60 / 60 / 1000)
  const time_date = time.split(' ')[1]
  if (result < 24) {
    return result + "小时前";
  }
  else if (ptime < todayTime && yesterdayTime <= ptime) {
    return '昨天' + time_date.substring(0, time_date.length - 3);
  }
  else if (ptime < yesterdayTime && lastYesterdayTime <= ptime) {
    return '前天' + time_date.substring(0, time_date.length - 3);
  }
  else {
    return time.substring(5, time.length - 9);
  }
}
//数据库
const db_config = {
  host: "host",
  user: "user",
  password: "password",
  port: "port",
  database: "database"
}

//登录
var wx = {
  "appid": "appid",
  "secret": "secret"
}


app.post('/login', (req, res) => {
  var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code'
  request(url, (err, response, body) => {
    var session = JSON.parse(body)
    if (session.openid) {
      var db = mysql.createConnection(db_config)
      db.connect()
      var sql = "SELECT openid FROM user WHERE openid='" + session.openid + "'"
      console.log(sql)
      db.query(sql, (err, result) => {
        if (JSON.stringify(result) !== "[]") {
          res.json({ openid: result[0].openid })
          db.end()
        }
        else {
          db.query("INSERT INTO user(openid,collect) VALUES ('" + session.openid + "','')")
          res.json({ openid: session.openid })
          db.end()
        }
      })
    }
  })
})


app.post('/checklogin', (req, res) => {
  var db = mysql.createConnection(db_config)
  db.connect()
  db.query("SELECT * FROM user WHERE openid='" + req.body.openid + "'", (err, result) => {
    res.json({
      is_login: JSON.stringify(result) !== "[]"
    })
  })
  db.end()
})

//新闻
function getid(sql, callback) {
  var db = mysql.createConnection(db_config)
  db.connect()
  db.query(sql, (err, result) => {
    if (result[0].collect == null) {
      var id = undefined
      db.end()
      callback(id)
    }
    else {
      var id = result[0].collect.substring(0, result[0].collect.length - 1)
      db.end()
      callback(id)
    }
  })
}

app.post('/news', (req, res) => {
  let sql = "SELECT id,title,source,image,image_list,pubtime,DATE_FORMAT(pubdate, '%Y-%m-%d') AS date FROM news WHERE channel='" + req.body.channel + "' ORDER BY pubdate DESC,pubtime DESC LIMIT " + 10 * (req.body.page - 1) + ",10"
  var db = mysql.createConnection(db_config);
  db.connect()
  db.query(sql, (err, result) => {
    db.end();
    for (let i = 0; i < result.length; i++) {
      result[i].image_list = JSON.parse(result[i].image_list)
      let pubDate = matchTime(result[i].date + " " + result[i].pubtime)
      result[i].pubDate = pubDate
    }
    // console.log('[' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '] 发送成功')
    res.json({ news: result })
  })

})

app.post('/new', (req, res) => {
  let sql = "SELECT *,DATE_FORMAT(pubdate, '%Y-%m-%d') AS date FROM news WHERE id='" + req.body.id + "'"
  var db = mysql.createConnection(db_config);
  db.connect()
  db.query(sql, (err, result) => {
    db.end();
    result[0].image_list = JSON.parse(result[0].image_list)
    result[0].content = JSON.parse(result[0].content)
    let pubDate = matchTime(result[0].date + " " + result[0].pubtime)
    result[0].pubDate = pubDate
    res.json({ new: result[0] })
  })

})

app.post('/weather', (req, res) => {
  request({
    url: 'http://saweather.market.alicloudapi.com/gps-to-weather?needMoreDay=0&lng=' + req.body.longitude + '&needAlarm=0&from=1&need3HourForcast=0&needIndex=0&lat=' + req.body.latitude + '&needHourData=0',
    method: "GET",
    json: true,
    headers: {
      "content-type": "application/json",
      "Authorization": "Authorization"
    },
  }, function (error, response, request) {
    if (!error && response.statusCode == 200) {
      res.json({ weather: request.showapi_res_body })
    }
  })
})

app.post('/local', (req, res) => {
  let sql = `SELECT *,DATE_FORMAT(pubdate, '%Y-%m-%d') AS date FROM news WHERE title LIKE "%` + req.body.city + `%" ORDER BY pubdate DESC,pubtime DESC LIMIT ` + 10 * (req.body.page - 1) + `,10`
  console.log(sql)
  var db = mysql.createConnection(db_config);
  db.connect()
  db.query(sql, (err, result) => {
    var news = result
    for (let i = 0; i < news.length; i++) {
      result[i].image_list = JSON.parse(result[i].image_list)
      result[i].content = JSON.parse(result[i].content)
      let pubDate = matchTime(result[i].date + " " + result[i].pubtime)
      result[i].pubDate = pubDate
      delete result[i].date; delete result[i].pubdate; delete result[i].pubtime; delete result[i].link;
    }
    console.log('[' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '] 发送成功')
    res.json({ news: news })
    delete news; delete result;
  })
  db.end();
})

app.post('/collect', (req, res) => {
  let check = "SELECT collect FROM user WHERE openid='" + req.body.openid + "'"
  var sql
  getid(check, (id) => {
    if (req.body.status) {
      if (id == undefined) { sql = "update user set collect='\"" + req.body.id + "\",' where openid='" + req.body.openid + "'" }
      else { sql = "update user set collect=CONCAT(collect,'\"" + req.body.id + "\",') where openid='" + req.body.openid + "'" }
      var db = mysql.createConnection(db_config);
      db.connect()
      db.query(sql)
      db.query(check, (err, result) => {
        res.json({ status: result[0].collect.search(req.body.id) !== -1 })
      })
      db.end()
    }
    else {
      sql = "update user set collect=REPLACE(collect,'\"" + req.body.id + "\",','') where openid='" + req.body.openid + "'"
      var db = mysql.createConnection(db_config);
      db.connect()
      db.query(sql)
      db.query(check, (err, result) => {
        res.json({ status: result[0].collect.search(req.body.id) !== -1 })
      })
      db.end()
    }
  })
})

app.post('/getcollect', (req, res) => {
  var sql = "SELECT collect FROM user WHERE openid='" + req.body.openid + "'"
  getid(sql, (id) => {
    if (id == undefined) { res.json({ collect: undefined }) }
    else {
      var db = mysql.createConnection(db_config)
      db.connect()
      db.query("SELECT *,DATE_FORMAT(pubdate, '%Y-%m-%d') AS date FROM news WHERE id in (" + id + ")", (err, result) => {
        if (result == undefined) {
          res.json({ collect: undefined })
        }
        else {
          for (let i = 0; i < result.length; i++) {
            result[i].image_list = JSON.parse(result[i].image_list)
            result[i].content = JSON.parse(result[i].content)
            result[i].date = result[i].date.substring(5, result[i].date.length)
            delete result[i].pubdate; delete result[i].pubtime; delete result[i].link;
          }
          res.json({ collect: result })
        }
      })
      db.end()
    }
  })
})

app.post('/checkcollect', (req, res) => {
  let sql = "SELECT collect FROM user WHERE openid='" + req.body.openid + "'"
  var db = mysql.createConnection(db_config);
  db.connect()
  db.query(sql, (err, result) => {
    if (result[0].collect == null) { res.json({ collect: false }) }
    else { res.json({ collect: result[0].collect.search(req.body.id) !== -1 }) }
  })
  db.end()
})


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

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
module.exports = app;
