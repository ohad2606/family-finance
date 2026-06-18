import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getRecurring, createRecurring, updateRecurring, deleteRecurring, getAccounts, getCategories, getLoans } from '../api/finance'
import DateInput from '../components/DateInput'
import BottomSheet from '../components/BottomSheet'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const FREQ_LABELS = { weekly: 'שבועי', monthly: 'חודשי', yearly: 'שנתי' }

const today = () => new Date().toISOString().slice(0, 10)

function nextDateForDay(day) {
  const d = parseInt(day)
  if (!d || d < 1 || d > 31) return today()
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), d)
  const result = thisMonth > now ? thisMonth : new Date(now.getFullYear(), now.getMonth() + 1, d)
  return result.toISOString().slice(0, 10)
}

const emptyForm = () => ({
  kind: 'expense', amount: '', account_id: '', category_id: '',
  description: '', frequency: 'monthly', next_date: today(), end_date: '',
  day_of_month: '',
})

const LOAN_ICONS = { mortgage: '🏠', personal: '💳', car: '🚗', student: '🎓', other: '📄' }
const TRACK_LABELS = { fixed: 'קל"צ', prime: 'פריים', cpi_linked: 'צמוד מדד' }

function nextLoanPaymentDate(loan) {
  const today = new Date()
  const day = loan.payment_day || parseInt(loan.start_date.slice(8, 10), 10)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), day)
  return thisMonth > today ? thisMonth : new Date(today.getFullYear(), today.getMonth() + 1, day)
}

export default function RecurringPage({ onBack }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [sheet, setSheet] = useState(null)   // null | 'add' | rule-object (edit)
  const [form, setForm] = useState(emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [error, setError] = useState('')

  const { data: rules = [], isLoading } = useQuery({ queryKey: ['recurring'], queryFn: getRecurring })
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: loans = [] } = useQuery({ queryKey: ['loans'], queryFn: getLoans })

  const activeLoans = loans.filter(l => l.is_active)

  const filteredCats = categories.filter(c => c.kind === form.kind)

  const saveMut = useMutation({
    mutationFn: sheet && sheet !== 'add'
      ? data => updateRecurring(sheet.id, data)
      : createRecurring,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setSheet(null); setError('') },
    onError: e => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => updateRecurring(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteRecurring,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setConfirmDelete(null) },
  })

  const openAdd = () => { setForm(emptyForm()); setError(''); setSheet('add') }
  const openEdit = (r) => {
    const dayOfMonth = r.frequency === 'monthly'
      ? String(new Date(r.next_date + 'T12:00:00').getDate())
      : ''
    setForm({
      kind: r.kind, amount: String(r.amount), account_id: String(r.account_id),
      category_id: r.category_id ? String(r.category_id) : '',
      description: r.description || '', frequency: r.frequency,
      next_date: r.next_date, end_date: r.end_date || '',
      day_of_month: dayOfMonth,
    })
    setError('')
    setSheet(r)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    if (!form.amount || !form.account_id) { setError('סכום וחשבון הם שדות חובה'); return }
    if (form.frequency === 'monthly' && !form.day_of_month) { setError('יש לציין יום בחודש'); return }
    const next_date = form.frequency === 'monthly'
      ? nextDateForDay(form.day_of_month)
      : form.next_date
    const payload = {
      kind: form.kind, description: form.description || null,
      amount: parseFloat(form.amount),
      account_id: parseInt(form.account_id),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      frequency: form.frequency,
      next_date,
      end_date: form.end_date || null,
    }
    saveMut.mutate(payload)
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h1 style={styles.title}>תשלומים חוזרים</h1>
      </header>

      <main style={styles.main}>
        {isLoading ? <p style={styles.empty}>טוען...</p> :
          rules.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.empty}>אין כללי חזרה עדיין</p>
              <p style={{ color: C.muted, fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
                הגדר תשלומים חוזרים כמו משכורת, שכירות, מנויים
              </p>
              <button style={styles.emptyAction} onClick={openAdd}>הוסף כלל ראשון</button>
            </div>
          ) : (
            <div style={styles.list}>
              {rules.map(r => (
                <div key={r.id} style={{ ...styles.card, opacity: r.is_active ? 1 : 0.55 }}>
                  <div style={styles.cardMain} onClick={() => openEdit(r)}>
                    <div style={styles.cardIcon}>
                      <span>{r.category_icon || (r.kind === 'income' ? '💰' : '💸')}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.cardDesc}>{r.description || r.category_name || '—'}</p>
                      <p style={styles.cardMeta}>
                        {r.account_name} · {FREQ_LABELS[r.frequency]}
                        {r.frequency === 'monthly'
                          ? ` · ב-${new Date(r.next_date + 'T12:00:00').getDate()} לחודש`
                          : ` · הבא: ${new Date(r.next_date + 'T12:00:00').toLocaleDateString('he-IL')}`}
                      </p>
                    </div>
                    <p style={{ ...styles.cardAmount, color: r.kind === 'income' ? C.income : C.expense }}>
                      {r.kind === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </p>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      style={{ ...styles.toggleBtn, background: r.is_active ? C.income : C.muted }}
                      onClick={() => toggleMut.mutate({ id: r.id, is_active: !r.is_active })}
                    >
                      {r.is_active ? 'פעיל' : 'מושהה'}
                    </button>
                    <button style={styles.deleteSmallBtn} onClick={() => setConfirmDelete(r)}>מחק</button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Loans & mortgages section */}
        {activeLoans.length > 0 && (() => {
          const mortgages = activeLoans.filter(l => l.loan_type === 'mortgage')
          const otherLoans = activeLoans.filter(l => l.loan_type !== 'mortgage')
          const groups = [
            mortgages.length > 0 && {
              icon: '🏠', label: 'משכנתאות', count: mortgages.length,
              total: mortgages.reduce((s, l) => s + l.monthly_payment, 0),
              nextDate: mortgages.map(nextLoanPaymentDate).sort((a, b) => a - b)[0],
            },
            otherLoans.length > 0 && {
              icon: '💳', label: 'הלוואות', count: otherLoans.length,
              total: otherLoans.reduce((s, l) => s + l.monthly_payment, 0),
              nextDate: otherLoans.map(nextLoanPaymentDate).sort((a, b) => a - b)[0],
            },
          ].filter(Boolean)

          return (
            <div style={{ marginTop: 20 }}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>הלוואות ומשכנתאות</span>
                <button style={styles.sectionLink} onClick={() => navigate('/loans')}>לפירוט ←</button>
              </div>
              <div style={styles.list}>
                {groups.map(g => {
                  const dateStr = g.nextDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
                  return (
                    <div key={g.label} style={styles.card} onClick={() => navigate('/loans')}>
                      <div style={{ ...styles.cardMain }}>
                        <div style={styles.cardIcon}><span>{g.icon}</span></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={styles.cardDesc}>{g.label} <span style={{ color: C.muted, fontWeight: 400 }}>({g.count})</span></p>
                          <p style={styles.cardMeta}>חודשי · ב-{dateStr}</p>
                        </div>
                        <p style={{ ...styles.cardAmount, color: C.expense }}>-{fmt(g.total)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </main>

      {/* FAB */}
      <button style={styles.fab} onClick={openAdd}>+</button>

      {/* Add / Edit sheet */}
      {sheet !== null && (
        <BottomSheet onClose={() => setSheet(null)}>
          <h2 style={styles.sheetTitle}>{sheet === 'add' ? 'הוסף כלל חזרה' : 'עריכת כלל'}</h2>

          <div style={styles.kindToggle}>
            {['expense', 'income'].map(k => (
              <button key={k}
                style={{ ...styles.kindBtn, ...(form.kind === k ? { background: k === 'income' ? C.income : C.expense, color: '#fff' } : {}) }}
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
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>

            <input style={styles.input} placeholder="תיאור (אופציונלי)" value={form.description} onChange={set('description')} />

            <select style={styles.select} value={form.frequency} onChange={set('frequency')}>
              <option value="weekly">שבועי</option>
              <option value="monthly">חודשי</option>
              <option value="yearly">שנתי</option>
            </select>

            {form.frequency === 'monthly' ? (
              <div>
                <label style={styles.label}>יום בחודש לתשלום / קבלה</label>
                <input style={styles.input} type="number" placeholder="לדוגמה: 1 או 10"
                  value={form.day_of_month}
                  onChange={e => setForm(f => ({ ...f, day_of_month: e.target.value }))}
                  min="1" max="31" step="1" required />
              </div>
            ) : (
              <div>
                <label style={styles.label}>תאריך ראשון</label>
                <DateInput style={styles.input} value={form.next_date} onChange={set('next_date')} required />
              </div>
            )}
            <div>
              <label style={styles.label}>עד תאריך (אופציונלי — השאר ריק לתמידי)</label>
              <DateInput style={styles.input} value={form.end_date} onChange={set('end_date')} />
            </div>

            {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button style={{ ...styles.submitBtn, background: form.kind === 'income' ? C.income : C.expense }}
              type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? '...' : 'שמור'}
            </button>
          </form>
        </BottomSheet>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.dialog} onClick={e => e.stopPropagation()}>
            <p style={styles.dialogText}>למחוק את הכלל?</p>
            <p style={styles.dialogSub}>{confirmDelete.description || confirmDelete.category_name} · {fmt(confirmDelete.amount)}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>ביטול</button>
              <button style={styles.confirmBtn} disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete.id)}>
                {deleteMut.isPending ? '...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  fab: { position: 'fixed', bottom: 72, insetInlineEnd: 24, width: 56, height: 56, borderRadius: '50%', background: C.brass, color: '#fff', border: 'none', fontSize: '1.8rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,162,63,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300, lineHeight: 1, zIndex: 40 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.25rem 0.5rem', borderBottom: `1px solid ${C.line}`, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: C.ink },
  sectionLink: { background: 'none', border: 'none', color: C.brass, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0 },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: C.card, borderRadius: 14, overflow: 'hidden' },
  cardMain: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1rem', cursor: 'pointer' },
  cardIcon: { width: 36, height: 36, borderRadius: '50%', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' },
  cardDesc: { margin: 0, fontWeight: 600, color: C.ink, fontSize: '0.9rem' },
  cardMeta: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  cardAmount: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.95rem', margin: 0, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  cardActions: { display: 'flex', gap: 8, padding: '0 1rem 0.75rem', borderTop: `1px solid ${C.line}` },
  toggleBtn: { padding: '0.3rem 0.75rem', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.8rem', marginTop: 8 },
  deleteSmallBtn: { padding: '0.3rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.expense, fontFamily: 'Assistant, sans-serif', fontSize: '0.8rem', marginTop: 8 },
  emptyCard: { textAlign: 'center', padding: '3rem 0' },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem 0' },
  emptyAction: { padding: '0.5rem 1.25rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  sheetTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 1rem', fontSize: '1.1rem' },
  kindToggle: { display: 'flex', gap: 8, marginBottom: '1rem' },
  kindBtn: { flex: 1, padding: '0.5rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  amountInput: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: `2px solid ${C.line}`, background: 'transparent', color: C.ink, padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums' },
  select: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', width: '100%', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.75rem', color: C.muted, marginBottom: 4 },
  submitBtn: { padding: '0.8rem', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  dialog: { background: C.card, borderRadius: 18, padding: '1.5rem', width: '100%', maxWidth: 320, margin: '0 auto', fontFamily: 'Assistant, sans-serif', alignSelf: 'center' },
  dialogText: { margin: 0, fontWeight: 700, color: C.ink },
  dialogSub: { margin: '6px 0 0', color: C.muted, fontSize: '0.85rem' },
  cancelBtn: { flex: 1, padding: '0.7rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  confirmBtn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: 10, background: C.expense, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700 },
}
