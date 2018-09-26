module.exports = {
  apps: [{
    name: 'programOne',
    script: 'app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    output: './log/pm2out.log',
    error: './log/pm2.error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      REMOTE_ADDR: '127.0.0.1',
      PORT: '8089'
    },
    env_production: {
      NODE_ENV: 'production',
      REMOTE_ADDR: '192.168.1.123',
      PORT: '8080'
    }
  }],

  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
}
