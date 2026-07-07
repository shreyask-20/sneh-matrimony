module.exports = {
  apps: [
    {
      name: "sneh-matrimony",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/sneh-matrimony",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/sneh-matrimony-error.log",
      out_file: "/var/log/sneh-matrimony-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: 5000,
    },
  ],
};
