module.exports = {
  apps: [
    {
      name: "kaspi-backend",
      script: "venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8001",
      cwd: "/home/ubuntu/kaspi/backend",
      interpreter: "none",
      env: { ENVIRONMENT: "production" },
      error_file: "/home/ubuntu/kaspi/logs/backend-error.log",
      out_file: "/home/ubuntu/kaspi/logs/backend-out.log",
    },
    {
      name: "kaspi-backend-dev",
      script: "venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8002 --reload",
      cwd: "/home/ubuntu/kaspi/backend",
      interpreter: "none",
      env: { ENVIRONMENT: "development" },
      error_file: "/home/ubuntu/kaspi/logs/backend-dev-error.log",
      out_file: "/home/ubuntu/kaspi/logs/backend-dev-out.log",
    },
  ],
};
