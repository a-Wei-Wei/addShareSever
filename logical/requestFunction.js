var rq = require('request-promise')
var cheerio = require('cheerio')
var MongoClinet = require('mongodb')
var assert = require('assert')
var async = require('async')
var log4js = require('log4js')
var log4jsconfig = require('../config/logconfig')
log4js.configure(log4jsconfig.config)
var logger = log4js.getLogger('running')

const url = 'mongodb://localhost:27017'
const total = { count: 0 }

function runThree (site, ips) {
  return new Promise((resolve, reject) => {
    async.eachLimit(ips, 10, function (item, callback) {
      if (item) {
        var options = {
          url: site,
          proxy: item.ip,
          headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
            'Host': 'www.dianping.com',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive' },
          rejectUnauthorized: false,
          timeout: 10000
        }
        rq.get(options).then((data) => {
          var $ = cheerio.load(data, { decodeEntities: false })
          if ($('div.right').text().indexOf('墨墨阅读') !== -1) {
            total.count++
          }
        }).catch((err) => {
          if (err) {
            logger.error(err.message)
          }
        }).finally(function () {
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

function launching (site, event) {
  async.series({
    one: function (callback) {
      getIps('test').then((data) => {
        runThree(site, data).then((data) => {
          if (data) {
            callback(null, '1 done')
          }
        })
      })
        .catch((err) => {
          logger.error('runThird has error : ' + err)
        })
    }
  }, (err, result) => {
    if (err) {
      logger.error('Async serise has error : ' + err)
    }
    event.emit('result', total.count, site)
    console.log('all done!!!')
    total.count = 0
  })
}

module.exports = { run: launching }
