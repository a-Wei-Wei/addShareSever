var total = { 'count': 0 }
var superagent = require('superagent')
// var cheerio = require('cheerio')
var useragents = require('./userAgent')
var MongoClinet = require('mongodb')
var assert = require('assert')
var superagentProxy = require('superagent-proxy')
var async = require('async')

const url = 'mongodb://localhost:27017'
superagentProxy(superagent)
function ado (newUrl) {
  return new Promise((resolve, reject) => {
    /// ///////////////

    function run (ips) {
      // for (let i = 0; i < ips.length; i++) {

      // }

      async.map(ips, function (item, callback) {
        singleFunction(item, callback)
      }, function (err, lastCount) {
        if (err) {
          reject(new Error('from one.js(:56) has err, and err : ' + err))
        } else {
          resolve(lastCount)
        }
      })
    }

    function singleFunction (item, callback) {
      var site = newUrl
      var header = { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', 'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6', 'Host': 'www.dianping.com', 'User-Agent': useragents[3] + '', 'Cache-Control': 'max-age=0', 'Connection': 'keep-alive' }
      try {
        superagent
          .get(site)
          .proxy('http://' + item.ip)
          .set(header)
          .set({ 'Content-Type': 'application/json' })
          .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
          .timeout(10000)
          .end(function (err, sres) {
            try {
              if (sres) {
                // console.log('status = ' + sres.status)
                if (sres.text.indexOf('墨墨阅读') !== -1) {
                  total.count++
                  console.log(total.count)
                  callback(null, total.count)
                }
              }
            } catch (error) {
              // console.log('SomeWrong : ' + error)
              return
            }

            if (err) {
              // console.log(err)
            }
          })
      } catch (error) {
        // console.log('have Error : ')
        // console.log(error)
      }
    }

    function getIps () {
      return new Promise((resolve, reject) => {
        try {
          MongoClinet.connect(url, { useNewUrlParser: true }, (err, db) => {
            assert.strictEqual(null, err)
            var dbase = db.db('Ips')
            dbase.collection('maybework_0912').find({}).toArray().then((doc) => {
              resolve(doc)
              db.close()
            })
          })
        } catch (error) {
          reject(error)
        }
      })
    }

    // run()
    getIps().then((data) => {
      run(data)
    })

    /// ///////////////
  })
}

module.exports = { catchData: ado }
