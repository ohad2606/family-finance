import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccount } from '../api/finance'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C' }

const TYPES = [
  { value: 'checking', label: 'עו"ש' },
  { value: 'savings', label: 'חיסכון' },
  { value: 'cash', label: 'מזומן' },
  { value: 'credit', label: 'אשראי' },
  { value: 'investment', label: 'השקעות' },
]

export default function AddAccountSheet({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', type: 'checking', institution: '', opening_balance: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); qc.invalidateQueries({ queryKey: ['dashboard-summary'] }); onClose() },
    onError: e => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!form.name) { setError('שם הוא שדה חובה'); return }
    mutation.mutate({ ...form, opening_balance: parseFloat(form.opening_balance || 0) })
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <h2 style={styles.title}>הוסף חשבון</h2>
        <form onSubmit={submit} style={styles.form}>
          <input style={styles.input} placeholder="שם החשבון" value={form.name} onChange={set('name')} required />
          <select style={styles.input} value={form.type} onChange={set('type')}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input style={styles.input} placeholder="בנק / מוסד (אופציונלי)" value={form.institution} onChange={set('institution')} />
          <input style={styles.input} type="number" placeholder="יתרת פתיחה (ברירת מחדל: 0)" value={form.opening_balance} onChange={set('opening_balance')} step="0.01" />
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
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  btn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
}
