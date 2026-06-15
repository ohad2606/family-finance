import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccount } from '../api/finance'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C', income: '#2F6B4F' }

const TYPES = [
  { value: 'checking', label: 'עו"ש' },
  { value: 'savings', label: 'חיסכון' },
  { value: 'cash', label: 'מזומן' },
  { value: 'credit', label: 'אשראי' },
  { value: 'investment', label: 'השקעות' },
]

const IL_BANKS = ['בנק לאומי','בנק הפועלים','בנק דיסקונט','בנק מזרחי טפחות','בנק הבינלאומי','בנק ירושלים','בנק אוצר החייל','בנק מרכנתיל דיסקונט','בנק יהב','בנק פועלי אגודת ישראל','ONE ZERO','בנק הדואר','כרטיסי אשראי לישראל (כ.א.ל)','ישראכארט','מקס (לאומי קארד)','ויזה כ.א.ל','אמריקן אקספרס']

export default function AddAccountSheet({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', type: 'checking', institution: '', opening_balance: '', balanceNeg: false })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); qc.invalidateQueries({ queryKey: ['dashboard-summary'] }); onClose() },
    onError: e => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const submit = e => {
    e.preventDefault()
    if (!form.name) { setError('שם הוא שדה חובה'); return }
    const abs = parseFloat(form.opening_balance) || 0
    mutation.mutate({ ...form, opening_balance: form.balanceNeg ? -abs : abs })
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <h2 style={styles.title}>הוסף חשבון</h2>
        <form onSubmit={submit} style={styles.form}>
          <input style={styles.input} placeholder="שם החשבון" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

          <select style={styles.input} value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <input style={styles.input} list="il-banks-add" placeholder="בנק / מוסד (אופציונלי)"
            value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
          <datalist id="il-banks-add">
            {IL_BANKS.map(b => <option key={b} value={b} />)}
          </datalist>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button"
              style={{ flexShrink: 0, width: 44, height: 44, border: 'none', borderRadius: 10, background: form.balanceNeg ? C.expense : C.income, color: '#fff', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setForm(f => ({ ...f, balanceNeg: !f.balanceNeg }))}>
              {form.balanceNeg ? '−' : '+'}
            </button>
            <input style={{ ...styles.input, flex: 1, margin: 0 }} type="number" inputMode="decimal"
              placeholder="יתרת פתיחה (ברירת מחדל: 0)"
              value={form.opening_balance}
              onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))}
              min="0" step="0.01" />
          </div>

          {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '...' : 'הוסף חשבון'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif', boxSizing: 'border-box' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', boxSizing: 'border-box', width: '100%' },
  btn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
}
