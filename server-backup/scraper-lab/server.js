import express from 'express'
import { createScraper } from 'israeli-bank-scrapers'

const app = express()
app.use(express.json())

const CHROMIUM_PATH = '/usr/bin/chromium-browser'

const SCRAPERS_CONFIG = {
  discount: {
    label: 'בנק דיסקונט',
    fields: [
      { key: 'id', label: 'תעודת זהות', type: 'text' },
      { key: 'password', label: 'סיסמה', type: 'password' },
      { key: 'num', label: 'מספר ענף + חשבון', type: 'text', placeholder: 'לדוגמה: 012345678' },
    ],
  },
  isracard: {
    label: 'ישראכרט',
    fields: [
      { key: 'id', label: 'תעודת זהות', type: 'text' },
      { key: 'card6Digits', label: '6 ספרות אחרונות של הכרטיס', type: 'text', maxlength: 6 },
      { key: 'password', label: 'סיסמה', type: 'password' },
    ],
  },
  max: {
    label: 'מקס',
    fields: [
      { key: 'username', label: 'שם משתמש / אימייל', type: 'text' },
      { key: 'password', label: 'סיסמה', type: 'password' },
    ],
  },
}

app.get('/', (req, res) => {
  const tabs = Object.entries(SCRAPERS_CONFIG)
    .map(([id, cfg]) => `<button class="tab" data-scraper="${id}" onclick="showTab('${id}')">${cfg.label}</button>`)
    .join('')

  const forms = Object.entries(SCRAPERS_CONFIG).map(([id, cfg]) => {
    const fields = cfg.fields.map(f => {
      if (f.type === 'password') {
        return `
      <label>
        <span>${f.label}</span>
        <div class="pw-wrap">
          <input type="password" name="${f.key}" autocomplete="off" required />
          <button type="button" class="pw-toggle" onclick="togglePw(this)" tabindex="-1"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
      </label>`
      }
      return `
      <label>
        <span>${f.label}</span>
        <input type="${f.type}" name="${f.key}"
          ${f.placeholder ? `placeholder="${f.placeholder}"` : ''}
          ${f.maxlength ? `maxlength="${f.maxlength}"` : ''}
          autocomplete="off" required />
      </label>`
    }).join('')
    return `
      <div id="tab-${id}" class="tab-panel" style="display:none">
        <h2>${cfg.label}</h2>
        <form onsubmit="runScrape(event, '${id}')">
          ${fields}
          <label>
            <span>חודשים לאחור</span>
            <input type="number" name="months" value="1" min="1" max="12" />
          </label>
          <button type="submit" class="btn-run">הפעל סקרייפר ▶</button>
        </form>
      </div>`
  }).join('')

  res.send(`<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Scraper Lab</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: Assistant, sans-serif; background: #E9EBE4; color: #1B2A27; direction: rtl; }
    .wrap { max-width: 600px; margin: 0 auto; padding: 2rem 1.25rem; }
    h1 { font-size: 1.5rem; margin: 0 0 1.5rem; }
    .tabs { display: flex; gap: 8px; margin-bottom: 1.5rem; }
    .tab { flex: 1; padding: .55rem; border: 1px solid #D5D8CF; border-radius: 10px;
           background: transparent; cursor: pointer; font-family: inherit; font-size: .9rem;
           color: #6B746E; transition: all .2s; }
    .tab.active { background: #1B2A27; color: #fff; border-color: #1B2A27; font-weight: 600; }
    .tab-panel { background: #F7F8F4; border-radius: 16px; padding: 1.5rem; }
    h2 { margin: 0 0 1.25rem; font-size: 1.1rem; }
    label { display: flex; flex-direction: column; gap: 5px; margin-bottom: .9rem; font-size: .9rem; font-weight: 600; color: #6B746E; }
    input[type=text], input[type=password], input[type=number] {
      padding: .7rem 1rem; border: 1px solid #D5D8CF; border-radius: 10px;
      background: #E9EBE4; font-family: inherit; font-size: 1rem; color: #1B2A27;
      outline: none; transition: border-color .2s; }
    input:focus { border-color: #C9A23F; }
    .pw-wrap { display: flex; }
    .pw-wrap input { flex: 1; border-radius: 0 10px 10px 0; border-left: none; }
    .pw-toggle { display: flex; align-items: center; justify-content: center; width: 44px;
                 flex-shrink: 0; background: #E9EBE4; border: 1px solid #D5D8CF;
                 border-radius: 10px 0 0 10px; cursor: pointer; color: #6B746E; }
    .pw-toggle:hover { color: #1B2A27; }
    .btn-run { width: 100%; padding: .8rem; background: #C9A23F; color: #fff; border: none;
               border-radius: 12px; font-family: inherit; font-size: 1rem; font-weight: 700;
               cursor: pointer; margin-top: .5rem; box-shadow: 0 4px 16px rgba(201,162,63,.35); }
    .btn-run:disabled { opacity: .5; cursor: not-allowed; }
    #status { margin-top: 1.25rem; padding: .75rem 1rem; border-radius: 10px; font-size: .9rem; display: none; }
    #status.loading { background: #FEF3C7; color: #92400E; display: block; }
    #status.ok { background: #D1FAE5; color: #2F6B4F; display: block; }
    #status.err { background: #FEE2E2; color: #B0573C; display: block; }
    #results { margin-top: 1.25rem; }
    .account-block { background: #F7F8F4; border-radius: 14px; padding: 1.1rem; margin-bottom: 1rem; }
    .account-block h3 { margin: 0 0 .6rem; font-size: 1rem; }
    .account-meta { font-size: .78rem; color: #6B746E; margin-bottom: .75rem; }
    table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    th { text-align: right; padding: .4rem .5rem; border-bottom: 2px solid #D5D8CF; color: #6B746E; font-weight: 600; }
    td { padding: .4rem .5rem; border-bottom: 1px solid #D5D8CF; }
    .income { color: #2F6B4F; font-weight: 700; }
    .expense { color: #B0573C; font-weight: 700; }
    .warn { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px;
            padding: .5rem .75rem; font-size: .82rem; color: #92400E; margin-bottom: 1rem; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>🔬 Scraper Lab</h1>
  <p class="warn">⚠ הפרטים שתזין נשלחים רק לשרת זה ולא נשמרים בשום מקום. הניסוי בלבד.</p>
  <div class="tabs">${tabs}</div>
  ${forms}
  <div id="status"></div>
  <div id="results"></div>
</div>
<script>
  const EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
  const EYE_OFF = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
  function togglePw(btn) {
    const inp = btn.previousElementSibling
    const showing = inp.type === 'text'
    inp.type = showing ? 'password' : 'text'
    btn.innerHTML = showing ? EYE : EYE_OFF
  }

  let activeTab = 'discount'
  function showTab(id) {
    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none')
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.getElementById('tab-' + id).style.display = 'block'
    document.querySelector('[data-scraper=' + id + ']').classList.add('active')
    document.getElementById('status').className = ''
    document.getElementById('status').style.display = 'none'
    document.getElementById('results').innerHTML = ''
    activeTab = id
  }
  showTab('discount')

  const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)
  const fmtDate = d => d ? new Date(d).toLocaleDateString('he-IL') : ''

  async function runScrape(e, scraperId) {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('.btn-run')
    const status = document.getElementById('status')
    const results = document.getElementById('results')
    const data = Object.fromEntries(new FormData(form))

    btn.disabled = true
    btn.textContent = 'מתחבר...'
    status.className = 'loading'
    status.textContent = 'מתחבר ל' + document.querySelector('[data-scraper=' + scraperId + ']').textContent + '... עלול לקחת כ-30–90 שניות'
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    results.innerHTML = ''

    try {
      const base = location.pathname.replace(/[/]+$/, '')
      const res = await fetch(base + '/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scraperId, credentials: data, months: parseInt(data.months) || 1 }),
      })
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'שגיאה לא ידועה')
      }

      status.className = 'ok'
      status.textContent = '✓ התחבר בהצלחה — ' + json.accounts.length + ' חשבונות, ' +
        json.accounts.reduce((s, a) => s + (a.txns?.length || 0), 0) + ' תנועות'

      results.innerHTML = json.accounts.map(acc => {
        const txRows = (acc.txns || []).map(t => \`
          <tr>
            <td>\${fmtDate(t.date)}</td>
            <td>\${t.description || ''}</td>
            <td class="\${t.chargedAmount < 0 ? 'expense' : 'income'}">\${fmt(t.chargedAmount)}</td>
            <td>\${fmt(t.currentBalance)}</td>
            <td>\${t.status || ''}</td>
          </tr>\`).join('')
        return \`
          <div class="account-block">
            <h3>\${acc.accountNumber || acc.id || 'חשבון'}</h3>
            <div class="account-meta">סוג: \${acc.type || '—'} | יתרה: \${fmt(acc.balance)}</div>
            \${txRows ? \`<table>
              <thead><tr><th>תאריך</th><th>תיאור</th><th>סכום</th><th>יתרה</th><th>סטטוס</th></tr></thead>
              <tbody>\${txRows}</tbody>
            </table>\` : '<p style="color:#6B746E;font-size:.85rem">אין תנועות בטווח שנבחר</p>'}
          </div>\`
      }).join('')

    } catch (err) {
      status.className = 'err'
      status.textContent = '✗ שגיאה: ' + err.message
    } finally {
      btn.disabled = false
      btn.textContent = 'הפעל סקרייפר ▶'
    }
  }
<\/script>
</body>
</html>`)
})

app.post('/scrape', async (req, res) => {
  const { scraperId, credentials, months = 1 } = req.body

  if (!SCRAPERS_CONFIG[scraperId]) {
    return res.status(400).json({ error: 'scraper לא קיים' })
  }

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  startDate.setDate(1)

  try {
    const scraper = createScraper({
      companyId: scraperId,
      startDate,
      showBrowser: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: CHROMIUM_PATH,
    })

    const result = await scraper.scrape(credentials)

    if (!result.success) {
      return res.status(400).json({ error: result.errorType + ': ' + (result.errorMessage || 'התחברות נכשלה') })
    }

    const accounts = (result.accounts || []).map(acc => ({
      accountNumber: acc.accountNumber,
      type: acc.type,
      balance: acc.balance,
      txns: (acc.txns || []).map(t => ({
        date: t.date,
        description: t.description,
        chargedAmount: t.chargedAmount,
        currentBalance: t.currentBalance,
        status: t.status,
        type: t.type,
      })),
    }))

    res.json({ success: true, accounts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () => {
  console.log('Scraper Lab running on http://localhost:3001')
})
