var superagent = require('superagent')
var useragents = require('./userAgent')
var MongoClinet = require('mongodb')
var assert = require('assert')
var superagentProxy = require('superagent-proxy')
var async = require('async')
var log4js = require('log4js')
var log4jsconfig = require('../config/logconfig')
log4js.configure(log4jsconfig.config)
var logger = log4js.getLogger('running')
var counterLogger = log4js.getLogger('counter')
superagentProxy(superagent)
const url = 'mongodb://localhost:27017'
const total = { count: 0 }
function runThree (site, ips) {
  return new Promise((resolve, reject) => {
    async.eachLimit(ips, 15, function (item, callback) {
      if (item) {
        var header = { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6', 'Host': 'www.dianping.com', 'User-Agent': useragents[3] + '', 'Cache-Control': 'max-age=0', 'Connection': 'keep-alive' }
        superagent
          .get(site)
          .proxy('http://' + item.ip)
          .set(header)
          .set({ 'Content-Type': 'application/json' })
          .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
          .timeout(10000)
          .end(function (err, sres) {
            if (err) {
              logger.error('Third superagent has error : ' + err)
            }
            if (sres) {
              if (sres.text.indexOf('墨墨阅读') !== -1) {
                total.count++
                // console.log('3a')
                counterLogger.info('runThree running count -->' + total.count)
              }
            }
            callback(null)
          })
      }
    }, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
function runFour (site, ips) {
  return new Promise((resolve, reject) => {
    async.eachLimit(ips, 25, function (item, callback) {
      if (item) {
        var header = { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6', 'Host': 'www.dianping.com', 'User-Agent': useragents[3] + '', 'Cache-Control': 'max-age=0', 'Connection': 'keep-alive' }
        superagent
          .get(site)
          .proxy(item.ip)
          .set(header)
          .set({ 'Content-Type': 'application/json' })
          .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
          .timeout(10000)
          .end(function (err, sres) {
            if (err) {
              logger.error('Fourth superagent has error : ' + err)
            }
            if (sres) {
              if (sres.text.indexOf('墨墨阅读') !== -1) {
                total.count++
                counterLogger.info('FourThree running count -->' + total.count)
              }
            }
            callback(null)
          })
      }
    }, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}
function getIps (collectionName) {
  return new Promise((resolve, reject) => {
    try {
      MongoClinet.connect(url, { useNewUrlParser: true }, (err, db) => {
        assert.strictEqual(null, err)
        var dbase = db.db('Ips')
        dbase.collection(collectionName).find({}).toArray().then((doc) => {
          resolve(doc)
          db.close()
        })
      })
    } catch (error) {
      logger.error('GetIps has error : ' + error)
      reject(error)
    }
  })
}

function launching (site, event, count) {
  return new Promise((resolve, reject) => {
    async.series({
      one: function (callback) {
        getIps('0920_http_intergrate_300').then((data) => {
          runFour(site, data, count).then((data) => {
            if (data) {
              callback(null, '1 done')
            }
          })
        })
          .catch((err) => {
            logger.error('runFour has error : ' + err)
          })
      },
      tow: function (callback) {
        getIps('0920_http_intergrate').then((data) => {
          runFour(site, data, count).then((data) => {
            if (data) {
              callback(null, '2 done')
            }
          })
        })
          .catch((err) => {
            logger.error('runFour has error : ' + err)
          })
      }
    }, (err, result) => {
      if (err) {
        reject(new Error('has err :' + err))
        logger.error('Async serise has error : ' + err)
      }
      event.emit('result', total.count, site)
      console.log('all done!!!')
      resolve(total.count)
      total.count = 0
    })
  })
}

module.exports = { run: launching }
