import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccount } from '../api/finance'
import BottomSheet from './BottomSheet'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C', income: '#2F6B4F' }

const TYPES = [
  { value: 'checking', label: 'עו"ש' },
  { value: 'savings', label: 'חיסכון' },
  { value: 'cash', label: 'מזומן' },
  { value: 'credit', label: 'אשראי' },
  { value: 'investment', label: 'השקעות' },
]

const IL_BANKS = ['בנק לאומי','בנק הפועלים','בנק דיסקונט','בנק מזרחי טפחות','בנק הבינלאומי','בנק ירושלים','בנק אוצר החייל','בנק מרכנתיל דיסקונט','בנק יהב','בנק פועלי אגודת ישראל','ONE ZERO','בנק הדואר','כרטיסי אשראי לישראל (כ.א.ל)','ישראכארט','מקס (לאומי קארד)','ויזה כ.א.ל','אמריקן אקספרס']

function BankInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  const suggestions = focused
    ? IL_BANKS.filter(b => !value || b.includes(value)).slice(0, 5)
    : []

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={styles.input}
        placeholder="בנק / מוסד (אופציונלי)"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <div style={styles.suggestions}>
          {suggestions.map(b => (
            <button key={b} type="button" style={styles.suggestion}
              onMouseDown={() => onChange(b)}
              onTouchStart={() => onChange(b)}>
              {b}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
    <BottomSheet onClose={onClose}>
      <h2 style={styles.title}>הוסף חשבון</h2>
      <form onSubmit={submit} style={styles.form}>
        <input style={styles.input} placeholder="שם החשבון" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

        <select style={styles.input} value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <BankInput
          value={form.institution}
          onChange={v => setForm(f => ({ ...f, institution: v }))}
        />

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
    </BottomSheet>
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
  suggestions: { position: 'absolute', top: '100%', right: 0, left: 0, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: 2 },
  suggestion: { display: 'block', width: '100%', padding: '0.65rem 1rem', background: 'none', border: 'none', textAlign: 'right', fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, cursor: 'pointer', borderBottom: `1px solid ${C.line}` },
}
