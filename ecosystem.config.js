// PM2 Ecosystem — Hostinger VPS Production
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup

module.exports = {
  apps: [
    {
      name: 'eduprime-backend',
      script: './backend/dist/main.js',
      cwd: '/var/www/eduprime',
      instances: 2,                     // 2 workers (adjust to CPU count)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/eduprime/backend-error.log',
      out_file:   '/var/log/eduprime/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'eduprime-frontend',
      script: './frontend/.next/standalone/server.js',
      cwd: '/var/www/eduprime',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: '/var/log/eduprime/frontend-error.log',
      out_file:   '/var/log/eduprime/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
