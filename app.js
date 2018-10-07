var express = require('express')
var app = express()
var mogran = require('morgan')
var catchData = require('./logical/requestFunction')
var bodyParser = require('body-parser')
var events = require('events')
var log4js = require('log4js')
var log4jsconfig = require('./config/logconfig')
var event = new events.EventEmitter()
app.use(mogran('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
log4js.configure(log4jsconfig.config)

var LogFile = log4js.getLogger('out')

app.all('/go', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.sendStatus(200)/* 让options请求快速返回 */
  else next()
})

app.post('/go', (req, res, next) => {
  var count = 0
  event.emit('runProgram', req.body.site, event, count)
  return res.json({ 'count': '正在努力完成任务......' })
})
app.get('/go', (req, res, next) => {
  event.emit('runProgram', 'https://www.maimemo.com/share/page/?uid=3433470&pid=9146f12fffc01d755ea5420810e926f9')
  res.sendStatus(200)
  res.end()
})
app.all('*', (req, res) => {
  res.sendStatus(404)
})
/* events */
event.on('runProgram', (site, varEvent, count) => {
  catchData.run(site, event)
})
event.on('result', (data, site) => {
  LogFile.info('输入的网站 : ' + site)
  LogFile.info('成功刷的次数 : --> ' + data)
})
app.listen((process.env.PORT || 8089), (process.env.REMOTE_ADDR || '127.0.0.1'), function () {
  console.log('running at * ' + (process.env.REMOTE_ADDR || '127.0.0.1') + ':' + (process.env.PORT || 8089))
})
