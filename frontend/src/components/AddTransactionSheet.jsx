import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, getAccounts, getCategories } from '../api/finance'
import DateInput from './DateInput'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
  planned: '#D97706',
}

const today = () => new Date().toISOString().slice(0, 10)
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }

export default function AddTransactionSheet({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    kind: 'expense', amount: '', account_id: '', category_id: '',
    description: '', transaction_date: today(), is_planned: false,
  })
  const [error, setError] = useState('')

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const filtered = categories.filter(c => c.kind === form.kind)

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['planned-transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
    },
    onError: (e) => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const togglePlanned = () => setForm(f => ({
    ...f,
    is_planned: !f.is_planned,
    transaction_date: !f.is_planned ? tomorrow() : today(),
  }))

  const submit = e => {
    e.preventDefault()
    if (!form.amount) { setError('נא להזין סכום'); return }
    mutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
      account_id: form.account_id ? parseInt(form.account_id) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    })
  }

  const accentColor = form.is_planned ? C.planned : (form.kind === 'income' ? C.income : C.expense)

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <h2 style={styles.title}>הוסף תנועה</h2>

        <div style={styles.kindToggle}>
          {['expense', 'income'].map(k => (
            <button key={k} style={{ ...styles.kindBtn, ...(form.kind === k && !form.is_planned ? { background: k === 'income' ? C.income : C.expense, color: '#fff' } : {}) }}
              onClick={() => setForm(f => ({ ...f, kind: k, category_id: '' }))}>
              {k === 'income' ? 'הכנסה' : 'הוצאה'}
            </button>
          ))}
          <button
            style={{ ...styles.kindBtn, ...(form.is_planned ? { background: C.planned, color: '#fff' } : {}) }}
            onClick={togglePlanned}
          >
            📅 מתוכנן
          </button>
        </div>

        {form.is_planned && (
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: C.planned, background: '#FFF7ED', borderRadius: 8, padding: '0.4rem 0.75rem', border: '1px solid #FED7AA' }}>
            ההוצאה לא תיספר עד שתאשר שהיא קרתה
          </p>
        )}

        <form onSubmit={submit} style={styles.form}>
          <input style={{ ...styles.amountInput, borderBottomColor: accentColor }} type="number" placeholder="0" min="0" step="0.01"
            value={form.amount} onChange={set('amount')} inputMode="decimal" />

          <select style={styles.select} value={form.account_id} onChange={set('account_id')}>
            <option value="">ללא חשבון ספציפי</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select style={styles.select} value={form.category_id} onChange={set('category_id')}>
            <option value="">קטגוריה (אופציונלי)</option>
            {filtered.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>

          <input style={styles.input} placeholder="תיאור (אופציונלי)" value={form.description} onChange={set('description')} />

          <div>
            <label style={{ fontSize: '0.78rem', color: C.muted, display: 'block', marginBottom: 4 }}>
              {form.is_planned ? 'תאריך מתוכנן' : 'תאריך'}
            </label>
            <DateInput style={styles.input} value={form.transaction_date} onChange={set('transaction_date')} />
          </div>

          {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button style={{ ...styles.submitBtn, background: accentColor }}
            type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '...' : form.is_planned ? 'שמור כמתוכנן' : 'שמור'}
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
  kindToggle: { display: 'flex', gap: 8, marginBottom: '1rem' },
  kindBtn: { flex: 1, padding: '0.5rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  amountInput: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: `2px solid ${C.line}`, background: 'transparent', color: C.ink, padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums' },
  select: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '0.8rem', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
}
