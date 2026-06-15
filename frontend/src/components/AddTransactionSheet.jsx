import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, getAccounts, getCategories } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const today = () => new Date().toISOString().slice(0, 10)

export default function AddTransactionSheet({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ kind: 'expense', amount: '', account_id: '', category_id: '', description: '', transaction_date: today() })
  const [error, setError] = useState('')

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const filtered = categories.filter(c => c.kind === form.kind)

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      onClose()
    },
    onError: (e) => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!form.amount || !form.account_id) { setError('סכום וחשבון הם שדות חובה'); return }
    mutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
      account_id: parseInt(form.account_id),
      category_id: form.category_id ? parseInt(form.category_id) : null,
    })
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.sheet}>
        <div style={styles.handle} />
        <h2 style={styles.title}>הוסף תנועה</h2>

        <div style={styles.kindToggle}>
          {['expense', 'income'].map(k => (
            <button key={k} style={{ ...styles.kindBtn, ...(form.kind === k ? { background: k === 'income' ? C.income : C.expense, color: '#fff' } : {}) }}
              onClick={() => setForm(f => ({ ...f, kind: k, category_id: '' }))}>
              {k === 'income' ? 'הכנסה' : 'הוצאה'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={styles.form}>
          <input style={styles.amountInput} type="number" placeholder="0" min="0" step="0.01"
            value={form.amount} onChange={set('amount')} inputMode="decimal" />

          <select style={styles.select} value={form.account_id} onChange={set('account_id')} required>
            <option value="">בחר חשבון</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select style={styles.select} value={form.category_id} onChange={set('category_id')}>
            <option value="">קטגוריה (אופציונלי)</option>
            {filtered.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>

          <input style={styles.input} placeholder="תיאור (אופציונלי)" value={form.description} onChange={set('description')} />
          <input style={styles.input} type="date" value={form.transaction_date} onChange={set('transaction_date')} />

          {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <button style={{ ...styles.submitBtn, background: form.kind === 'income' ? C.income : C.expense }}
            type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '...' : 'שמור'}
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
  kindBtn: { flex: 1, padding: '0.5rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  amountInput: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: `2px solid ${C.line}`, background: 'transparent', color: C.ink, padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums' },
  select: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  submitBtn: { padding: '0.8rem', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
}
