module.exports = {
  apps: [
    {
      name: "zuzim-backend",
      script: "venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8001",
      cwd: "/home/ubuntu/zuzim/backend",
      interpreter: "none",
      env: { ENVIRONMENT: "production" },
      error_file: "/home/ubuntu/zuzim/logs/backend-error.log",
      out_file: "/home/ubuntu/zuzim/logs/backend-out.log",
    },
    {
      name: "zuzim-backend-dev",
      script: "venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8002 --reload",
      cwd: "/home/ubuntu/zuzim/backend",
      interpreter: "none",
      env: { ENVIRONMENT: "development" },
      error_file: "/home/ubuntu/zuzim/logs/backend-dev-error.log",
      out_file: "/home/ubuntu/zuzim/logs/backend-dev-out.log",
    },
  ],
};
