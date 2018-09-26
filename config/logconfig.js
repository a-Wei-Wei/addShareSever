var path = require('path')
var BASE_PATH = path.resolve('./')
module.exports = {
  config: {
    appenders: {
      out: { type: 'file', filename: path.join(BASE_PATH, '/log/logs.log'), maxLogSize: 10485760, backups: 3, compress: true },
      running: { type: 'file', filename: path.join(BASE_PATH, '/log/running.log'), maxLogSize: 10485760, backups: 3, compress: true },
      counter: { type: 'file', filename: path.join(BASE_PATH, '/log/counter.log'), maxLogSize: 10485760, backups: 3, compress: true }
    },
    categories: {
      default: { appenders: [ 'out' ], level: 'info' },
      out: { appenders: [ 'out' ], level: 'all' },
      running: { appenders: [ 'running' ], level: 'all' },
      counter: { appenders: [ 'counter' ], level: 'all' }
    },
    pm2: true
  }
}
