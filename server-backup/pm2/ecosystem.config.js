module.exports = { apps: [
  {
    "name": "takziv-backend",
    "cwd": "/home/ubuntu/takziv/backend",
    "script": "/home/ubuntu/takziv/backend/venv/bin/uvicorn",
    "args": "app.main:app --host 127.0.0.1 --port 8001"
  },
  {
    "name": "scraper-lab",
    "cwd": "/home/ubuntu/scraper-lab",
    "script": "/home/ubuntu/scraper-lab/server.js"
  }
] };
