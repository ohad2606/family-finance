import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLoans, createLoan, updateLoan, deleteLoan, getLoanSchedule } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)
const fmtPct = n => `${Number(n).toFixed(2)}%`

const TYPE_LABELS = { mortgage: 'משכנתא', personal: 'אישית', car: 'רכב', student: 'סטודנטים', other: 'אחר' }
const TYPE_ICONS = { mortgage: '🏠', personal: '💳', car: '🚗', student: '🎓', other: '📄' }

const emptyForm = () => ({
  name: '', loan_type: 'mortgage', principal: '', interest_rate: '',
  term_months: '', start_date: new Date().toISOString().slice(0, 10),
  monthly_payment: '', notes: '',
})

export default function LoansPage({ onBack }) {
  const qc = useQueryClient()
  const [sheet, setSheet] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [scheduleId, setScheduleId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: loans = [], isLoading } = useQuery({ queryKey: ['loans'], queryFn: getLoans })

  const { data: schedule = [], isLoading: schedLoading } = useQuery({
    queryKey: ['loan-schedule', scheduleId],
    queryFn: () => getLoanSchedule(scheduleId),
    enabled: !!scheduleId,
  })

  const saveMut = useMutation({
    mutationFn: sheet && sheet !== 'add' ? data => updateLoan(sheet.id, data) : createLoan,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); setSheet(null); setError('') },
    onError: e => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); setConfirmDelete(null) },
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(emptyForm()); setError(''); setSheet('add') }
  const openEdit = loan => {
    setForm({
      name: loan.name, loan_type: loan.loan_type, principal: String(loan.principal),
      interest_rate: String(loan.interest_rate), term_months: String(loan.term_months),
      start_date: loan.start_date, monthly_payment: loan.monthly_payment ? String(loan.monthly_payment) : '',
      notes: loan.notes || '',
    })
    setError('')
    setSheet(loan)
  }

  const submit = e => {
    e.preventDefault()
    if (!form.name || !form.principal || !form.interest_rate || !form.term_months) {
      setError('שם, קרן, ריבית ותקופה הם שדות חובה'); return
    }
    const payload = {
      name: form.name, loan_type: form.loan_type,
      principal: parseFloat(form.principal),
      interest_rate: parseFloat(form.interest_rate),
      term_months: parseInt(form.term_months),
      start_date: form.start_date,
      monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null,
      notes: form.notes || null,
    }
    saveMut.mutate(payload)
  }

  const totalDebt = loans.filter(l => l.is_active).reduce((s, l) => s + l.balance_remaining, 0)
  const schedLoan = scheduleId ? loans.find(l => l.id === scheduleId) : null

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={scheduleId ? () => setScheduleId(null) : onBack}>→</button>
        <h1 style={styles.title}>{scheduleId ? `לוח סילוקין — ${schedLoan?.name}` : 'הלוואות'}</h1>
        {!scheduleId && <button style={styles.addBtn} onClick={openAdd}>+ הוסף</button>}
      </header>

      {/* Schedule view */}
      {scheduleId ? (
        <main style={styles.main}>
          {schedLoan && (
            <div style={styles.schedSummary}>
              <div style={styles.schedStat}><span style={styles.schedVal}>{fmt(schedLoan.balance_remaining)}</span><span style={styles.schedLbl}>יתרה</span></div>
              <div style={styles.schedStat}><span style={styles.schedVal}>{fmt(schedLoan.monthly_payment)}</span><span style={styles.schedLbl}>תשלום חודשי</span></div>
              <div style={styles.schedStat}><span style={styles.schedVal}>{schedLoan.months_remaining}</span><span style={styles.schedLbl}>חודשים נותרו</span></div>
              <div style={styles.schedStat}><span style={{ ...styles.schedVal, color: C.expense }}>{fmt(schedLoan.total_interest)}</span><span style={styles.schedLbl}>סה"כ ריבית</span></div>
            </div>
          )}
          {schedLoading ? <p style={styles.empty}>טוען...</p> : (
            <div style={styles.schedTable}>
              <div style={styles.schedHeader}>
                <span style={styles.schedCol}>חודש</span>
                <span style={styles.schedCol}>תאריך</span>
                <span style={styles.schedCol}>קרן</span>
                <span style={styles.schedCol}>ריבית</span>
                <span style={styles.schedCol}>יתרה</span>
              </div>
              {schedule.map((row, i) => {
                const today = new Date()
                const payDate = new Date(row.payment_date + 'T12:00:00')
                const isPast = payDate < today
                const isCurrent = payDate.getMonth() === today.getMonth() && payDate.getFullYear() === today.getFullYear()
                return (
                  <div key={row.month_num} style={{
                    ...styles.schedRow,
                    background: isCurrent ? '#EFF6F2' : isPast ? 'transparent' : C.card,
                    opacity: isPast ? 0.5 : 1,
                    borderRight: isCurrent ? `3px solid ${C.income}` : '3px solid transparent',
                  }}>
                    <span style={styles.schedCol}>{row.month_num}</span>
                    <span style={styles.schedCol}>{payDate.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}</span>
                    <span style={{ ...styles.schedCol, color: C.income, fontFamily: 'Heebo, sans-serif', fontWeight: 600 }}>{fmt(row.principal_part)}</span>
                    <span style={{ ...styles.schedCol, color: C.expense, fontFamily: 'Heebo, sans-serif', fontWeight: 600 }}>{fmt(row.interest_part)}</span>
                    <span style={{ ...styles.schedCol, fontFamily: 'Heebo, sans-serif', fontWeight: 700 }}>{fmt(row.balance)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      ) : (
        /* Loans list */
        <main style={styles.main}>
          {loans.some(l => l.is_active) && (
            <div style={styles.totalCard}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>סה"כ חוב</p>
              <p style={styles.totalVal}>{fmt(totalDebt)}</p>
            </div>
          )}

          {isLoading ? <p style={styles.empty}>טוען...</p> :
            loans.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.empty}>אין הלוואות</p>
                <button style={styles.emptyAction} onClick={openAdd}>הוסף הלוואה</button>
              </div>
            ) : (
              <div style={styles.list}>
                {loans.map(loan => {
                  const pct = Math.max(0, Math.min(1, 1 - loan.balance_remaining / loan.principal))
                  return (
                    <div key={loan.id} style={{ ...styles.loanCard, opacity: loan.is_active ? 1 : 0.55 }}>
                      <div style={styles.loanTop}>
                        <span style={styles.loanIcon}>{TYPE_ICONS[loan.loan_type]}</span>
                        <div style={{ flex: 1 }}>
                          <p style={styles.loanName}>{loan.name}</p>
                          <p style={styles.loanMeta}>{TYPE_LABELS[loan.loan_type]} · {fmtPct(loan.interest_rate)} · {loan.term_months} חודשים</p>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={styles.loanBalance}>{fmt(loan.balance_remaining)}</p>
                          <p style={styles.loanBalanceLbl}>יתרה</p>
                        </div>
                      </div>

                      {/* Progress bar — repayment */}
                      <div style={styles.barTrack}>
                        <div style={{ ...styles.barFill, width: `${pct * 100}%` }} />
                      </div>
                      <div style={styles.loanProgressRow}>
                        <span style={{ color: C.income, fontSize: '0.72rem' }}>{fmt(loan.principal - loan.balance_remaining)} שולם</span>
                        <span style={{ color: C.muted, fontSize: '0.72rem' }}>{loan.months_remaining} חודשים נותרו</span>
                      </div>

                      <div style={styles.loanStats}>
                        <div style={styles.loanStat}>
                          <span style={styles.loanStatVal}>{fmt(loan.monthly_payment)}</span>
                          <span style={styles.loanStatLbl}>חודשי</span>
                        </div>
                        <div style={styles.loanStat}>
                          <span style={{ ...styles.loanStatVal, color: C.expense }}>{fmt(loan.total_interest)}</span>
                          <span style={styles.loanStatLbl}>סה"כ ריבית</span>
                        </div>
                      </div>

                      <div style={styles.loanActions}>
                        <button style={styles.schedBtn} onClick={() => setScheduleId(loan.id)}>לוח סילוקין</button>
                        <button style={styles.editSmallBtn} onClick={() => openEdit(loan)}>עריכה</button>
                        <button style={styles.deleteSmallBtn} onClick={() => setConfirmDelete(loan)}>מחק</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </main>
      )}

      {/* Add/Edit sheet */}
      {sheet !== null && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setSheet(null)}>
          <div style={styles.sheet}>
            <div style={styles.handle} />
            <h2 style={styles.sheetTitle}>{sheet === 'add' ? 'הוסף הלוואה' : 'עריכת הלוואה'}</h2>
            <form onSubmit={submit} style={styles.form}>
              <input style={styles.input} placeholder="שם ההלוואה (למשל: משכנתא בנק הפועלים)" value={form.name} onChange={set('name')} required />

              <select style={styles.select} value={form.loan_type} onChange={set('loan_type')}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{TYPE_ICONS[v]} {l}</option>)}
              </select>

              {sheet === 'add' && (
                <>
                  <input style={styles.input} type="number" placeholder="קרן (סכום מקורי)" value={form.principal} onChange={set('principal')} min="0" step="1" required />
                  <input style={styles.input} type="number" placeholder="ריבית שנתית (%)" value={form.interest_rate} onChange={set('interest_rate')} min="0" step="0.01" required />
                  <input style={styles.input} type="number" placeholder="תקופה (חודשים)" value={form.term_months} onChange={set('term_months')} min="1" step="1" required />
                  <div>
                    <label style={styles.label}>תאריך תחילת הלוואה</label>
                    <input style={styles.input} type="date" value={form.start_date} onChange={set('start_date')} required />
                  </div>
                </>
              )}

              <input style={styles.input} type="number" placeholder="תשלום חודשי (השאר ריק לחישוב אוטומטי)" value={form.monthly_payment} onChange={set('monthly_payment')} min="0" step="0.01" />
              <input style={styles.input} placeholder="הערות (אופציונלי)" value={form.notes} onChange={set('notes')} />

              {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              <button style={styles.submitBtn} type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? '...' : 'שמור'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.dialog} onClick={e => e.stopPropagation()}>
            <p style={styles.dialogText}>למחוק את ההלוואה?</p>
            <p style={styles.dialogSub}>{confirmDelete.name}</p>
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
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', color: C.ink, margin: 0, flex: 1 },
  addBtn: { padding: '0.35rem 0.85rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Assistant, sans-serif' },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  totalCard: { background: C.ink, borderRadius: 16, padding: '1rem 1.25rem', marginBottom: 12, textAlign: 'center' },
  totalVal: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: '#fff', margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  loanCard: { background: C.card, borderRadius: 16, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 },
  loanTop: { display: 'flex', alignItems: 'center', gap: 10 },
  loanIcon: { fontSize: '1.4rem', flexShrink: 0 },
  loanName: { margin: 0, fontWeight: 700, color: C.ink, fontSize: '0.95rem' },
  loanMeta: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  loanBalance: { margin: 0, fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1rem', color: C.expense, fontVariantNumeric: 'tabular-nums' },
  loanBalanceLbl: { margin: 0, color: C.muted, fontSize: '0.7rem', textAlign: 'left' },
  barTrack: { height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', background: C.income, borderRadius: 3, transition: 'width 0.4s ease' },
  loanProgressRow: { display: 'flex', justifyContent: 'space-between' },
  loanStats: { display: 'flex', gap: 16, paddingTop: 4, borderTop: `1px solid ${C.line}` },
  loanStat: { display: 'flex', flexDirection: 'column' },
  loanStatVal: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' },
  loanStatLbl: { color: C.muted, fontSize: '0.7rem' },
  loanActions: { display: 'flex', gap: 8 },
  schedBtn: { flex: 1, padding: '0.4rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.82rem' },
  editSmallBtn: { padding: '0.4rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.muted, fontFamily: 'Assistant, sans-serif', fontSize: '0.82rem' },
  deleteSmallBtn: { padding: '0.4rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.expense, fontFamily: 'Assistant, sans-serif', fontSize: '0.82rem' },
  emptyCard: { textAlign: 'center', padding: '3rem 0' },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem 0' },
  emptyAction: { padding: '0.5rem 1.25rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  // Schedule
  schedSummary: { display: 'flex', background: C.ink, borderRadius: 16, padding: '1rem', marginBottom: 12, justifyContent: 'space-around' },
  schedStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  schedVal: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', fontVariantNumeric: 'tabular-nums' },
  schedLbl: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' },
  schedTable: { background: C.card, borderRadius: 14, overflow: 'hidden' },
  schedHeader: { display: 'flex', padding: '0.5rem 0.75rem', borderBottom: `1px solid ${C.line}`, background: C.paper },
  schedRow: { display: 'flex', padding: '0.5rem 0.75rem', borderBottom: `1px solid ${C.line}` },
  schedCol: { flex: 1, fontSize: '0.78rem', color: C.ink, fontVariantNumeric: 'tabular-nums' },
  // Sheet
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  sheetTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  select: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right' },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', width: '100%', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.75rem', color: C.muted, marginBottom: 4 },
  submitBtn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  dialog: { background: C.card, borderRadius: 18, padding: '1.5rem', width: '100%', maxWidth: 320, margin: '0 auto', fontFamily: 'Assistant, sans-serif', alignSelf: 'center' },
  dialogText: { margin: 0, fontWeight: 700, color: C.ink },
  dialogSub: { margin: '6px 0 0', color: C.muted, fontSize: '0.85rem' },
  cancelBtn: { flex: 1, padding: '0.7rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  confirmBtn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: 10, background: C.expense, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700 },
}
