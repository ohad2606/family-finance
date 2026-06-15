import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudget, upsertBudget, getCategories } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
  warn: '#E07B30',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

function toMonthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function monthLabel(monthStr) {
  return new Date(monthStr + 'T12:00:00').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
}

function prevMonth(str) {
  const d = new Date(str + 'T12:00:00')
  d.setMonth(d.getMonth() - 1)
  return toMonthStr(d)
}

function nextMonth(str) {
  const d = new Date(str + 'T12:00:00')
  d.setMonth(d.getMonth() + 1)
  return toMonthStr(d)
}

export default function BudgetPage({ onBack }) {
  const qc = useQueryClient()
  const [month, setMonth] = useState(toMonthStr(new Date()))
  const [editing, setEditing] = useState(null) // { category_id, category_name, category_icon, amount_planned }
  const [editVal, setEditVal] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)

  const { data: lines = [], isLoading } = useQuery({
    queryKey: ['budget', month],
    queryFn: () => getBudget(month),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const expenseCats = categories.filter(c => c.kind === 'expense')

  const mutation = useMutation({
    mutationFn: upsertBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget', month] })
      setEditing(null)
      setShowAddCat(false)
    },
  })

  const totalPlanned = lines.reduce((s, l) => s + l.amount_planned, 0)
  const totalActual = lines.reduce((s, l) => s + l.amount_actual, 0)
  const overBudgetCount = lines.filter(l => l.amount_planned > 0 && l.amount_actual > l.amount_planned).length

  const openEdit = (line) => {
    setEditing(line)
    setEditVal(String(line.amount_planned || ''))
  }

  const saveEdit = () => {
    if (!editing) return
    mutation.mutate({
      category_id: editing.category_id,
      month,
      amount_planned: parseFloat(editVal) || 0,
    })
  }

  // cats not yet in budget lines
  const unbudgetedCats = expenseCats.filter(c => !lines.find(l => l.category_id === c.id))

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h1 style={styles.title}>תקציב</h1>
        <button style={styles.addBtn} onClick={() => setShowAddCat(true)}>+ קטגוריה</button>
      </header>

      {/* Month nav */}
      <div style={styles.monthNav}>
        <button style={styles.monthBtn} onClick={() => setMonth(prevMonth(month))}>‹</button>
        <span style={styles.monthLabel}>{monthLabel(month)}</span>
        <button style={styles.monthBtn} onClick={() => setMonth(nextMonth(month))}>›</button>
      </div>

      {/* Summary bar */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryNum}>{fmt(totalPlanned)}</span>
          <span style={styles.summaryLbl}>תוכנן</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={{ ...styles.summaryNum, color: totalActual > totalPlanned && totalPlanned > 0 ? C.expense : C.ink }}>
            {fmt(totalActual)}
          </span>
          <span style={styles.summaryLbl}>בפועל</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={{ ...styles.summaryNum, color: totalPlanned > totalActual ? C.income : C.expense }}>
            {fmt(Math.abs(totalPlanned - totalActual))}
          </span>
          <span style={styles.summaryLbl}>{totalPlanned >= totalActual ? 'נותר' : 'חריגה'}</span>
        </div>
      </div>

      {overBudgetCount > 0 && (
        <div style={styles.alertBanner}>
          ⚠️ {overBudgetCount} קטגוריות חרגו מהתקציב
        </div>
      )}

      <main style={styles.main}>
        {isLoading ? (
          <p style={styles.empty}>טוען...</p>
        ) : lines.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.empty}>אין תקציב מוגדר לחודש זה</p>
            <button style={styles.emptyAction} onClick={() => setShowAddCat(true)}>הוסף קטגוריה לתקציב</button>
          </div>
        ) : (
          <div style={styles.list}>
            {lines.map(line => {
              const pct = line.amount_planned > 0 ? Math.min(line.amount_actual / line.amount_planned, 1) : 0
              const over = line.amount_planned > 0 && line.amount_actual > line.amount_planned
              const barColor = over ? C.expense : pct > 0.8 ? C.warn : C.income
              return (
                <div key={line.category_id} style={styles.lineCard} onClick={() => openEdit(line)}>
                  <div style={styles.lineTop}>
                    <span style={styles.lineIcon}>{line.category_icon || '📁'}</span>
                    <span style={styles.lineName}>{line.category_name}</span>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ ...styles.lineActual, color: over ? C.expense : C.ink }}>{fmt(line.amount_actual)}</span>
                      {line.amount_planned > 0 && (
                        <span style={styles.linePlanned}> / {fmt(line.amount_planned)}</span>
                      )}
                    </div>
                  </div>
                  {line.amount_planned > 0 && (
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${pct * 100}%`, background: barColor }} />
                    </div>
                  )}
                  {over && (
                    <p style={styles.overText}>חריגה של {fmt(line.amount_actual - line.amount_planned)}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Edit planned amount */}
      {editing && (
        <div style={styles.overlay} onClick={() => setEditing(null)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.handle} />
            <h2 style={styles.sheetTitle}>{editing.category_icon} {editing.category_name}</h2>
            <p style={styles.sheetSub}>תקציב חודשי מתוכנן</p>
            <input
              style={styles.amountInput}
              type="number"
              placeholder="0"
              min="0"
              step="1"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              autoFocus
            />
            <button
              style={styles.saveBtn}
              disabled={mutation.isPending}
              onClick={saveEdit}
            >
              {mutation.isPending ? '...' : 'שמור'}
            </button>
          </div>
        </div>
      )}

      {/* Add unbudgeted category */}
      {showAddCat && (
        <div style={styles.overlay} onClick={() => setShowAddCat(false)}>
          <div style={styles.sheet} onClick={e => e.stopPropagation()}>
            <div style={styles.handle} />
            <h2 style={styles.sheetTitle}>הוסף קטגוריה לתקציב</h2>
            {unbudgetedCats.length === 0 ? (
              <p style={{ color: C.muted, textAlign: 'center', padding: '1rem 0' }}>כל הקטגוריות כבר בתקציב</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {unbudgetedCats.map(cat => (
                  <button key={cat.id} style={styles.catPickBtn} onClick={() => {
                    setShowAddCat(false)
                    setEditing({ category_id: cat.id, category_name: cat.name, category_icon: cat.icon, amount_planned: 0 })
                    setEditVal('')
                  }}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            )}
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
  addBtn: { padding: '0.35rem 0.85rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Assistant, sans-serif' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: C.card, borderBottom: `1px solid ${C.line}` },
  monthBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: C.muted, padding: '0 8px' },
  monthLabel: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, fontSize: '1rem' },
  summaryBar: { display: 'flex', background: C.ink, color: '#fff', padding: '1rem' },
  summaryItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  summaryDivider: { width: 1, background: 'rgba(255,255,255,0.2)', margin: '0 8px' },
  summaryNum: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' },
  summaryLbl: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' },
  alertBanner: { background: '#FEF3E2', color: C.warn, padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, borderBottom: `1px solid #F5C28A` },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  lineCard: { background: C.card, borderRadius: 14, padding: '0.85rem 1rem', cursor: 'pointer' },
  lineTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  lineIcon: { fontSize: '1rem', flexShrink: 0 },
  lineName: { flex: 1, fontWeight: 600, color: C.ink, fontSize: '0.9rem' },
  lineActual: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' },
  linePlanned: { color: C.muted, fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' },
  barTrack: { height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s ease' },
  overText: { margin: '4px 0 0', color: C.expense, fontSize: '0.75rem', fontWeight: 600 },
  emptyCard: { textAlign: 'center', padding: '3rem 0' },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem 0' },
  emptyAction: { padding: '0.5rem 1.25rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2.5rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  sheetTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 4px', fontSize: '1.1rem' },
  sheetSub: { color: C.muted, fontSize: '0.85rem', margin: '0 0 1rem' },
  amountInput: { width: '100%', fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2.2rem', textAlign: 'center', border: 'none', borderBottom: `2px solid ${C.line}`, background: 'transparent', color: C.ink, padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box', marginBottom: '1rem' },
  saveBtn: { width: '100%', padding: '0.85rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  catPickBtn: { padding: '0.75rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, textAlign: 'right', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink },
}
