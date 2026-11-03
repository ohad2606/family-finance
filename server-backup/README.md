# server-backup — תמונת מצב של המכונה family-finance-srv לפני מחיקתה (2026-11-03)

המכונה (OCI A1.Flex 1 OCPU/4GB, Ubuntu 24.04, IP 129.159.159.237) הגישה את family-finance.net
ואת ההפניה הישנה myzuzim.net. התיקייה הזו מכילה את כל מה שלא היה בקוד עצמו ואינו סודי.

## מה יש כאן
| תיקייה | תוכן |
|---|---|
| `nginx/zuzim.conf` | אתר ה-nginx (443 + הפניה מ-80, proxy ל-uvicorn על 127.0.0.1:8001). מפנה ל-`conf.d/bank-sync-auth.conf` שנמצא בחבילה הסודית |
| `pm2/ecosystem.config.js` | שני תהליכי PM2: `takziv-backend` (uvicorn) ו-`scraper-lab` (node) |
| `systemd/` | `pm2-ubuntu.service` ו-`bu-bot.service` (היה מושבת, התיקייה `~/bu_bot` כבר לא הייתה קיימת) |
| `scraper-lab/` | שרת express קטן עם `israeli-bank-scrapers` (האזין על :3001, גישה דרך Tailscale) |
| `Takziv_Design_System/` | מערכת העיצוב של takziv |
| `system/` | גרסאות, `pip freeze` של ה-venv, חבילות apt, כללי iptables, crontab |

## מה **לא** כאן (נשמר מחוץ ל-GitHub, הריפו ציבורי)
`family-finance-sensitive-2026-11-03.tgz`: dump של `takziv_db` (Fc + SQL), roles, שני ה-dumps הישנים
מ-`~/db-backups`, `backend/.env` (+ .bak), `/etc/letsencrypt` (תעודות ומפתחות), `conf.d/bank-sync-auth.conf`,
`loan_pdf.pdf`, `loans_sum.xlsx`, bash_history.

## שחזור בקצרה (Ubuntu 24.04)
```bash
sudo apt install -y nginx postgresql-16 python3-venv certbot python3-certbot-nginx && sudo npm i -g pm2
sudo -u postgres psql -f globals.sql && sudo -u postgres createdb -O takziv takziv_db
sudo -u postgres pg_restore -d takziv_db takziv_db.dump
git clone https://github.com/ohad2606/family-finance.git takziv && cd takziv/backend
python3 -m venv venv && venv/bin/pip install -r ../server-backup/system/pip-freeze.txt && cp /path/backend.env .env
cd ../frontend && npm ci && npm run build
sudo cp ../server-backup/nginx/zuzim.conf /etc/nginx/sites-available/zuzim && sudo ln -s ../sites-available/zuzim /etc/nginx/sites-enabled/
sudo cp /path/bank-sync-auth.conf /etc/nginx/conf.d/ && sudo certbot --nginx -d family-finance.net -d www.family-finance.net
pm2 start ../server-backend/pm2/ecosystem.config.js && pm2 save && pm2 startup
```
(לבדוק ב-zuzim.conf את נתיב ה-`root` של ה-frontend ואת הפורט 8001.)
