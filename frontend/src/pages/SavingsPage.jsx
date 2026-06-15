import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSavings, createSavings, updateSavings, deleteSavings } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const ICONS = ['🎯', '🏠', '✈️', '🚗', '👶', '💍', '📚', '💻', '🏖️', '🏋️', '🎓', '💰', '🌱', '🛡️']
const COLORS = ['#2F6B4F', '#C9A23F', '#4A7FA5', '#8B5CF6', '#E07B30', '#B0573C', '#1B2A27', '#6B746E']

const emptyForm = () => ({
  name: '', target_amount: '', current_amount: '0',
  target_date: '', icon: '🎯', color: '#2F6B4F',
})

export default function SavingsPage({ onBack }) {
  const qc = useQueryClient()
  const [sheet, setSheet] = useState(null)
  const [depositSheet, setDepositSheet] = useState(null)
  const [depositVal, setDepositVal] = useState('')
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: goals = [], isLoading } = useQuery({ queryKey: ['savings'], queryFn: getSavings })

  const saveMut = useMutation({
    mutationFn: sheet && sheet !== 'add' ? data => updateSavings(sheet.id, data) : createSavings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); setSheet(null); setError('') },
    onError: e => setError(e.response?.data?.detail || 'שגיאה'),
  })

  const depositMut = useMutation({
    mutationFn: ({ id, current_amount }) => updateSavings(id, { current_amount }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); setDepositSheet(null); setDepositVal('') },
  })

  const completeMut = useMutation({
    mutationFn: id => updateSavings(id, { is_completed: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteSavings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); setConfirmDelete(null) },
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(emptyForm()); setError(''); setSheet('add') }
  const openEdit = g => {
    setForm({
      name: g.name, target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      target_date: g.target_date || '', icon: g.icon || '🎯', color: g.color || '#2F6B4F',
    })
    setError('')
    setSheet(g)
  }

  const submit = e => {
    e.preventDefault()
    if (!form.name || !form.target_amount) { setError('שם ויעד הם שדות חובה'); return }
    saveMut.mutate({
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || 0),
      target_date: form.target_date || null,
      icon: form.icon,
      color: form.color,
    })
  }

  const activeGoals = goals.filter(g => !g.is_completed)
  const doneGoals = goals.filter(g => g.is_completed)
  const totalTarget = activeGoals.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = activeGoals.reduce((s, g) => s + g.current_amount, 0)

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h1 style={styles.title}>יעדי חיסכון</h1>
        <button style={styles.addBtn} onClick={openAdd}>+ הוסף</button>
      </header>

      <main style={styles.main}>
        {/* Overall progress */}
        {activeGoals.length > 0 && (
          <div style={styles.overallCard}>
            <div style={styles.overallTop}>
              <div>
                <p style={styles.overallLbl}>חסכת עד כה</p>
                <p style={styles.overallVal}>{fmt(totalCurrent)}</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={styles.overallLbl}>מתוך יעד</p>
                <p style={styles.overallVal}>{fmt(totalTarget)}</p>
              </div>
            </div>
            <div style={styles.overallBar}>
              <div style={{ ...styles.overallFill, width: `${Math.min(totalCurrent / totalTarget, 1) * 100}%` }} />
            </div>
            <p style={styles.overallPct}>{Math.round(totalCurrent / totalTarget * 100)}% מהיעד הכולל</p>
          </div>
        )}

        {isLoading ? <p style={styles.empty}>טוען...</p> :
          goals.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={{ fontSize: '2.5rem', margin: 0 }}>🎯</p>
              <p style={styles.emptyTitle}>אין יעדים עדיין</p>
              <p style={styles.emptyDesc}>הגדר יעד חיסכון — חופשה, רכב, קרן חירום</p>
              <button style={styles.emptyAction} onClick={openAdd}>הוסף יעד ראשון</button>
            </div>
          ) : (
            <>
              <div style={styles.list}>
                {activeGoals.map(g => <GoalCard key={g.id} goal={g}
                  onEdit={() => openEdit(g)}
                  onDeposit={() => { setDepositSheet(g); setDepositVal(String(g.current_amount)) }}
                  onComplete={() => completeMut.mutate(g.id)}
                  onDelete={() => setConfirmDelete(g)}
                />)}
              </div>

              {doneGoals.length > 0 && (
                <>
                  <p style={styles.sectionLabel}>הושלמו 🎉</p>
                  <div style={styles.list}>
                    {doneGoals.map(g => <GoalCard key={g.id} goal={g}
                      onEdit={() => openEdit(g)}
                      onDelete={() => setConfirmDelete(g)}
                    />)}
                  </div>
                </>
              )}
            </>
          )
        }
      </main>

      {/* Add/Edit sheet */}
      {sheet !== null && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setSheet(null)}>
          <div style={styles.sheet}>
            <div style={styles.handle} />
            <h2 style={styles.sheetTitle}>{sheet === 'add' ? 'יעד חיסכון חדש' : 'עריכת יעד'}</h2>
            <form onSubmit={submit} style={styles.form}>
              {/* Icon picker */}
              <div style={styles.iconRow}>
                {ICONS.map(ic => (
                  <button key={ic} type="button"
                    style={{ ...styles.iconBtn, ...(form.icon === ic ? { background: form.color, color: '#fff' } : {}) }}
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}>
                    {ic}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div style={styles.colorRow}>
                {COLORS.map(col => (
                  <button key={col} type="button"
                    style={{ ...styles.colorDot, background: col, ...(form.color === col ? { outline: `3px solid ${col}`, outlineOffset: 2 } : {}) }}
                    onClick={() => setForm(f => ({ ...f, color: col }))} />
                ))}
              </div>

              <input style={styles.input} placeholder="שם היעד (למשל: חופשה במאלדיביים)" value={form.name} onChange={set('name')} required />
              <input style={styles.input} type="number" placeholder="סכום יעד (₪)" value={form.target_amount} onChange={set('target_amount')} min="1" step="1" required />
              <input style={styles.input} type="number" placeholder="חסכת עד כה (₪)" value={form.current_amount} onChange={set('current_amount')} min="0" step="1" />
              <div>
                <label style={styles.label}>תאריך יעד (אופציונלי)</label>
                <input style={styles.input} type="date" value={form.target_date} onChange={set('target_date')} />
              </div>

              {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              <button style={{ ...styles.submitBtn, background: form.color }} type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? '...' : 'שמור'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit sheet */}
      {depositSheet && (
        <div style={styles.overlay} onClick={() => setDepositSheet(null)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.handle} />
            <h2 style={styles.sheetTitle}>{depositSheet.icon} {depositSheet.name}</h2>
            <p style={styles.sheetSub}>עדכן סכום שחסכת עד כה</p>
            <input
              style={{ ...styles.amountInput, borderColor: depositSheet.color }}
              type="number" min="0" step="1" value={depositVal}
              onChange={e => setDepositVal(e.target.value)}
              autoFocus
            />
            <button
              style={{ ...styles.submitBtn, background: depositSheet.color }}
              disabled={depositMut.isPending}
              onClick={() => depositMut.mutate({ id: depositSheet.id, current_amount: parseFloat(depositVal) || 0 })}>
              {depositMut.isPending ? '...' : 'עדכן'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.dialog} onClick={e => e.stopPropagation()}>
            <p style={styles.dialogText}>למחוק את היעד?</p>
            <p style={styles.dialogSub}>{confirmDelete.icon} {confirmDelete.name}</p>
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

function GoalCard({ goal, onEdit, onDeposit, onComplete, onDelete }) {
  const pctNum = Math.round(goal.pct * 100)
  const color = goal.color || C.brass
  const done = goal.is_completed

  return (
    <div style={{ ...styles.goalCard, opacity: done ? 0.7 : 1 }}>
      <div style={styles.goalTop}>
        <div style={{ ...styles.goalIconWrap, background: color + '22', border: `2px solid ${color}` }}>
          <span style={{ fontSize: '1.3rem' }}>{goal.icon || '🎯'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={styles.goalName}>{goal.name}</p>
            {done && <span style={{ fontSize: '0.7rem', background: C.income, color: '#fff', borderRadius: 6, padding: '1px 6px' }}>הושלם</span>}
          </div>
          {goal.target_date && (
            <p style={styles.goalDate}>יעד: {new Date(goal.target_date + 'T12:00:00').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</p>
          )}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ ...styles.goalCurrent, color }}>{fmt(goal.current_amount)}</p>
          <p style={styles.goalTarget}>מתוך {fmt(goal.target_amount)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${Math.min(pctNum, 100)}%`, background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ color, fontSize: '0.75rem', fontWeight: 700 }}>{pctNum}%</span>
        {goal.monthly_needed && !done && (
          <span style={{ color: C.muted, fontSize: '0.72rem' }}>{fmt(goal.monthly_needed)}/חודש</span>
        )}
        {goal.months_left && !done && (
          <span style={{ color: C.muted, fontSize: '0.72rem' }}>{goal.months_left} חודשים</span>
        )}
      </div>

      {/* Actions */}
      {!done && (
        <div style={styles.goalActions}>
          <button style={{ ...styles.actionBtn, color, borderColor: color + '44' }} onClick={onDeposit}>+ עדכן</button>
          <button style={styles.actionBtn} onClick={onEdit}>עריכה</button>
          {goal.pct >= 1 && <button style={{ ...styles.actionBtn, color: C.income }} onClick={onComplete}>✓ השלם</button>}
          <button style={{ ...styles.actionBtn, color: C.expense }} onClick={onDelete}>מחק</button>
        </div>
      )}
      {done && (
        <div style={styles.goalActions}>
          <button style={{ ...styles.actionBtn, color: C.expense }} onClick={onDelete}>מחק</button>
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
  addBtn: { padding: '0.35rem 0.85rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Assistant, sans-serif' },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  overallCard: { background: C.ink, borderRadius: 18, padding: '1.25rem', marginBottom: 12, color: '#fff' },
  overallTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  overallLbl: { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' },
  overallVal: { margin: '2px 0 0', fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' },
  overallBar: { height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  overallFill: { height: '100%', background: C.brass, borderRadius: 4, transition: 'width 0.4s ease' },
  overallPct: { margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 },
  sectionLabel: { color: C.muted, fontSize: '0.8rem', fontWeight: 600, margin: '8px 4px 4px' },
  goalCard: { background: C.card, borderRadius: 16, padding: '1rem' },
  goalTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  goalIconWrap: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalName: { margin: 0, fontWeight: 700, color: C.ink, fontSize: '0.95rem' },
  goalDate: { margin: 0, color: C.muted, fontSize: '0.72rem' },
  goalCurrent: { margin: 0, fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' },
  goalTarget: { margin: 0, color: C.muted, fontSize: '0.7rem', fontVariantNumeric: 'tabular-nums' },
  barTrack: { height: 8, background: C.line, borderRadius: 4, overflow: 'hidden', marginBottom: 2 },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  goalActions: { display: 'flex', gap: 6, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.line}` },
  actionBtn: { flex: 1, padding: '0.35rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: C.muted },
  emptyCard: { textAlign: 'center', padding: '3rem 1rem' },
  emptyTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, fontSize: '1.1rem', margin: '8px 0 4px' },
  emptyDesc: { color: C.muted, fontSize: '0.85rem', margin: '0 0 1rem' },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem' },
  emptyAction: { padding: '0.6rem 1.5rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2.5rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif', maxHeight: '90vh', overflowY: 'auto' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  sheetTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 4px', fontSize: '1.1rem' },
  sheetSub: { color: C.muted, fontSize: '0.85rem', margin: '0 0 1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  iconRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.line}`, background: C.paper, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  colorRow: { display: 'flex', gap: 8 },
  colorDot: { width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer' },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', width: '100%', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.75rem', color: C.muted, marginBottom: 4 },
  amountInput: { width: '100%', fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2.2rem', textAlign: 'center', border: 'none', borderBottom: '2px solid', background: 'transparent', color: C.ink, padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box', marginBottom: '1rem' },
  submitBtn: { padding: '0.85rem', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  dialog: { background: C.card, borderRadius: 18, padding: '1.5rem', width: '100%', maxWidth: 320, margin: '0 auto', fontFamily: 'Assistant, sans-serif', alignSelf: 'center' },
  dialogText: { margin: 0, fontWeight: 700, color: C.ink },
  dialogSub: { margin: '6px 0 0', color: C.muted, fontSize: '0.85rem' },
  cancelBtn: { flex: 1, padding: '0.7rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  confirmBtn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: 10, background: C.expense, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700 },
}
