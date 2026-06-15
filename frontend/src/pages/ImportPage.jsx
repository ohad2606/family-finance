import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Papa from 'papaparse'
import { getAccounts, getCategories, bulkImportTransactions } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const STEP = { UPLOAD: 0, MAP: 1, PREVIEW: 2, DONE: 3 }

function parseDate(str) {
  if (!str) return null
  const s = str.trim()
  let m
  if ((m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/))) {
    const [, d, mo, y] = m
    const year = y.length === 2 ? '20' + y : y
    return `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  if ((m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/))) {
    const [, y, mo, d] = m
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function parseAmount(str) {
  if (str == null) return null
  const cleaned = String(str).replace(/[,\s₪$€£]/g, '').replace(/\((.+)\)/, '-$1')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function inferKind(amount, kindStr) {
  if (kindStr) {
    const s = kindStr.trim().toLowerCase()
    if (s === 'income' || s === 'הכנסה' || s === 'זכות' || s === 'credit' || s === 'זכות') return 'income'
    if (s === 'expense' || s === 'הוצאה' || s === 'חובה' || s === 'debit') return 'expense'
  }
  return amount >= 0 ? 'income' : 'expense'
}

export default function ImportPage({ onBack }) {
  const qc = useQueryClient()
  const fileRef = useRef()
  const [step, setStep] = useState(STEP.UPLOAD)
  const [drag, setDrag] = useState(false)
  const [headers, setHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [map, setMap] = useState({ date: '', amount: '', desc: '', kind: '' })
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [defaultKind, setDefaultKind] = useState('expense')
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])
  const [imported, setImported] = useState(0)

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const doImport = useMutation({
    mutationFn: (rows) => bulkImportTransactions(rows),
    onSuccess: (data) => {
      qc.invalidateQueries()
      setImported(data.imported)
      setStep(STEP.DONE)
    },
  })

  function handleFile(file) {
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        if (!data.length) return
        const hdrs = meta.fields ?? []
        setHeaders(hdrs)
        setRawRows(data)
        const autoMap = { date: '', amount: '', desc: '', kind: '' }
        for (const h of hdrs) {
          const l = h.toLowerCase()
          if (!autoMap.date && (l.includes('date') || l.includes('תאריך') || l === 'date')) autoMap.date = h
          if (!autoMap.amount && (l.includes('amount') || l.includes('סכום') || l.includes('sum') || l.includes('חיוב') || l.includes('זיכוי'))) autoMap.amount = h
          if (!autoMap.desc && (l.includes('desc') || l.includes('תיאור') || l.includes('name') || l.includes('פירוט') || l.includes('description'))) autoMap.desc = h
          if (!autoMap.kind && (l.includes('kind') || l.includes('type') || l.includes('סוג') || l.includes('credit') || l.includes('debit'))) autoMap.kind = h
        }
        setMap(autoMap)
        if (accounts.length === 1) setAccountId(String(accounts[0].id))
        setStep(STEP.MAP)
      },
    })
  }

  function buildPreview() {
    const errs = []
    if (!map.date) errs.push('יש לבחור עמודת תאריך')
    if (!map.amount) errs.push('יש לבחור עמודת סכום')
    if (!accountId) errs.push('יש לבחור חשבון')
    if (errs.length) { setErrors(errs); return }

    const rows = []
    const parseErrs = []
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]
      const dateStr = parseDate(row[map.date])
      const rawAmt = parseAmount(row[map.amount])
      if (!dateStr) { parseErrs.push(`שורה ${i + 2}: תאריך לא תקין "${row[map.date]}"`); continue }
      if (rawAmt == null) { parseErrs.push(`שורה ${i + 2}: סכום לא תקין "${row[map.amount]}"`); continue }
      const kind = map.kind ? inferKind(rawAmt, row[map.kind]) : (rawAmt >= 0 ? defaultKind === 'auto' ? 'income' : defaultKind : 'expense')
      const amount = Math.abs(rawAmt)
      rows.push({
        transaction_date: dateStr,
        amount,
        kind,
        description: map.desc ? (row[map.desc] ?? '').slice(0, 250) || null : null,
        account_id: parseInt(accountId),
        category_id: categoryId ? parseInt(categoryId) : null,
      })
    }
    setErrors(parseErrs.slice(0, 5))
    setPreview(rows)
    setStep(STEP.PREVIEW)
  }

  function confirmImport() {
    doImport.mutate(preview)
  }

  const noCol = <option value="">— לא לממפות —</option>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={step === STEP.UPLOAD || step === STEP.DONE ? onBack : () => setStep(step - 1)}>→</button>
        <h1 style={s.title}>ייבוא CSV</h1>
        {step > STEP.UPLOAD && step < STEP.DONE && (
          <span style={s.stepLabel}>{step}/{STEP.PREVIEW}</span>
        )}
      </header>

      <main style={s.main}>
        {/* ── Step 0: Upload ── */}
        {step === STEP.UPLOAD && (
          <div
            style={{ ...s.dropZone, ...(drag ? { borderColor: C.brass, background: C.brass + '11' } : {}) }}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current.click()}>
            <span style={{ fontSize: '2.5rem' }}>📂</span>
            <p style={{ fontWeight: 700, color: C.ink, margin: '8px 0 4px' }}>גרור קובץ CSV לכאן</p>
            <p style={{ color: C.muted, fontSize: '0.85rem', margin: 0 }}>או לחץ לבחירת קובץ</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {/* ── Step 1: Map ── */}
        {step === STEP.MAP && (
          <div style={s.card}>
            <p style={s.hint}>נמצאו <strong>{rawRows.length}</strong> שורות ו-<strong>{headers.length}</strong> עמודות. מפו את העמודות:</p>

            {[
              { key: 'date', label: 'תאריך', required: true },
              { key: 'amount', label: 'סכום', required: true },
              { key: 'desc', label: 'תיאור', required: false },
              { key: 'kind', label: 'סוג (הכנסה/הוצאה)', required: false },
            ].map(({ key, label, required }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={s.label}>{label}{required ? ' *' : ''}</label>
                <select style={s.select} value={map[key]} onChange={e => setMap(m => ({ ...m, [key]: e.target.value }))}>
                  {noCol}
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}

            {!map.kind && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>ברירת מחדל לסוג עסקה</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['expense', 'income'].map(k => (
                    <button key={k}
                      style={{ ...s.chip, ...(defaultKind === k ? { background: k === 'income' ? C.income : C.expense, color: '#fff', borderColor: 'transparent' } : {}) }}
                      onClick={() => setDefaultKind(k)}>
                      {k === 'expense' ? 'הוצאה' : 'הכנסה'}
                    </button>
                  ))}
                  <button style={{ ...s.chip, ...(defaultKind === 'auto' ? { background: C.muted, color: '#fff', borderColor: 'transparent' } : {}) }}
                    onClick={() => setDefaultKind('auto')}>
                    אוטו (לפי סימן)
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>חשבון *</label>
              <select style={s.select} value={accountId} onChange={e => setAccountId(e.target.value)}>
                <option value="">— בחר חשבון —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>קטגוריה (אופציונלי)</label>
              <select style={s.select} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">— ללא קטגוריה —</option>
                {categories.filter(c => c.kind === defaultKind || map.kind).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {errors.length > 0 && (
              <div style={s.errBox}>{errors.map((e, i) => <p key={i} style={{ margin: '2px 0' }}>{e}</p>)}</div>
            )}

            <button style={s.primaryBtn} onClick={buildPreview}>המשך לתצוגה מקדימה ›</button>
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === STEP.PREVIEW && (
          <>
            <div style={{ ...s.card, background: C.ink, color: '#fff', textAlign: 'center', padding: '1.25rem' }}>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>עסקאות לייבוא</p>
              <p style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: '2rem', margin: '4px 0' }}>{preview.length}</p>
              {errors.length > 0 && (
                <p style={{ fontSize: '0.78rem', opacity: 0.7, margin: 0 }}>{errors.length} שורות דולגו (שגיאת עיצוב)</p>
              )}
            </div>

            <div style={s.card}>
              <p style={s.hint}>תצוגה מקדימה — 10 שורות ראשונות:</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['תאריך', 'סכום', 'סוג', 'תיאור'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td style={s.td}>{r.transaction_date}</td>
                        <td style={{ ...s.td, fontFamily: 'Heebo', color: r.kind === 'income' ? C.income : C.expense }}>
                          {r.kind === 'income' ? '+' : '-'}₪{r.amount.toLocaleString()}
                        </td>
                        <td style={s.td}>{r.kind === 'income' ? 'הכנסה' : 'הוצאה'}</td>
                        <td style={{ ...s.td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button style={s.primaryBtn} onClick={confirmImport} disabled={doImport.isPending}>
              {doImport.isPending ? 'מייבא...' : `ייבא ${preview.length} עסקאות`}
            </button>
            {doImport.isError && (
              <p style={{ color: C.expense, textAlign: 'center', fontSize: '0.9rem' }}>
                שגיאה: {doImport.error?.response?.data?.detail ?? 'נסה שוב'}
              </p>
            )}
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === STEP.DONE && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: 'Heebo', fontWeight: 900, color: C.income, fontSize: '1.5rem', margin: '0 0 8px' }}>
              {imported} עסקאות יובאו בהצלחה!
            </h2>
            <p style={{ color: C.muted, marginBottom: 28 }}>כל הנתונים מעודכנים בחשבונות שלך</p>
            <button style={s.primaryBtn} onClick={onBack}>חזור לתפריט</button>
          </div>
        )}

        {/* Tips */}
        {step === STEP.UPLOAD && (
          <div style={{ ...s.card, marginTop: 16 }}>
            <p style={{ ...s.label, marginBottom: 10 }}>טיפים לייצוא מהבנק</p>
            {[
              { bank: 'בנק לאומי', tip: 'פעולות בחשבון → ייצוא לאקסל/CSV' },
              { bank: 'בנק הפועלים', tip: 'פירוט תנועות → שמירה כ-Excel' },
              { bank: 'מזרחי טפחות', tip: 'תנועות בחשבון → ייצוא' },
              { bank: 'דיסקונט', tip: 'פירוט חשבון → הורדת קובץ' },
            ].map(({ bank, tip }) => (
              <div key={bank} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontWeight: 700, color: C.ink, flexShrink: 0, fontSize: '0.85rem' }}>{bank}</span>
                <span style={{ color: C.muted, fontSize: '0.82rem' }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 100 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  stepLabel: { color: C.muted, fontSize: '0.85rem' },
  main: { padding: '1rem', maxWidth: 560, margin: '0 auto' },
  dropZone: { border: `2px dashed ${C.line}`, borderRadius: 20, padding: '3rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: C.card, transition: 'all 0.15s' },
  card: { background: C.card, borderRadius: 18, padding: '1.1rem', marginBottom: 12 },
  hint: { color: C.muted, fontSize: '0.85rem', margin: '0 0 14px' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.muted, marginBottom: 5, letterSpacing: 0.3 },
  select: { width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, background: '#fff', appearance: 'auto', direction: 'rtl', outline: 'none' },
  chip: { padding: '0.35rem 0.8rem', border: `1px solid ${C.line}`, borderRadius: 20, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem', color: C.muted, fontWeight: 600 },
  errBox: { background: '#FEE2E2', borderRadius: 10, padding: '0.75rem', marginBottom: 14, color: C.expense, fontSize: '0.82rem' },
  primaryBtn: { width: '100%', padding: '0.85rem', background: C.ink, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', marginTop: 4 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', direction: 'rtl' },
  th: { padding: '6px 8px', color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.line}`, textAlign: 'right', whiteSpace: 'nowrap' },
  td: { padding: '6px 8px', color: C.ink, borderBottom: `1px solid ${C.line}`, textAlign: 'right' },
}
