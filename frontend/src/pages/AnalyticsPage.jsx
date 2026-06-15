import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSpending, getCashflow } from '../api/finance'
import DonutChart from '../components/DonutChart'
import CashflowChart from '../components/CashflowChart'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

function toMonthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function monthLabel(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
}
function prevMonth(str) {
  const d = new Date(str + 'T12:00:00'); d.setMonth(d.getMonth() - 1); return toMonthStr(d)
}
function nextMonth(str) {
  const d = new Date(str + 'T12:00:00'); d.setMonth(d.getMonth() + 1); return toMonthStr(d)
}

const PALETTE = [
  '#2F6B4F', '#C9A23F', '#4A7FA5', '#8B5CF6', '#E07B30',
  '#B0573C', '#1B879E', '#6B746E', '#9B4F8B', '#3D7A5E',
]

export default function AnalyticsPage({ onBack }) {
  const navigate = useNavigate()
  const [month, setMonth] = useState(toMonthStr(new Date()))
  const [kind, setKind] = useState('expense')

  const { data: spending = [], isLoading } = useQuery({
    queryKey: ['spending', month, kind],
    queryFn: () => getSpending(month, kind),
  })

  const { data: cashflow = [] } = useQuery({
    queryKey: ['cashflow'],
    queryFn: () => getCashflow(6),
  })

  const total = spending.reduce((s, d) => s + d.amount, 0)

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h1 style={styles.title}>ניתוח</h1>
      </header>

      {/* Month nav */}
      <div style={styles.monthNav}>
        <button style={styles.monthBtn} onClick={() => setMonth(prevMonth(month))}>‹</button>
        <span style={styles.monthLabel}>{monthLabel(month)}</span>
        <button style={styles.monthBtn} onClick={() => setMonth(nextMonth(month))}>›</button>
      </div>

      {/* Kind toggle */}
      <div style={styles.kindRow}>
        {['expense', 'income'].map(k => (
          <button key={k}
            style={{ ...styles.kindBtn, ...(kind === k ? { background: k === 'income' ? C.income : C.expense, color: '#fff', borderColor: 'transparent' } : {}) }}
            onClick={() => setKind(k)}>
            {k === 'income' ? 'הכנסות' : 'הוצאות'}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {/* Donut */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{kind === 'expense' ? 'הוצאות' : 'הכנסות'} לפי קטגוריה</h2>
            <span style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: kind === 'expense' ? C.expense : C.income }}>
              {fmt(total)}
            </span>
          </div>

          {isLoading ? (
            <p style={styles.empty}>טוען...</p>
          ) : spending.length === 0 ? (
            <p style={styles.empty}>אין נתונים לחודש זה</p>
          ) : (
            <>
              <DonutChart data={spending} size={220} />

              {/* Table */}
              <div style={styles.table}>
                {spending.map((d, i) => (
                  <div key={d.category_id ?? i} style={styles.tableRow}
                    onClick={() => navigate(`/transactions?category_id=${d.category_id}&from_date=${month}&to_date=${nextMonth(month).replace('-01', '')}&kind=${kind}`)}>
                    <div style={{ ...styles.dot, background: PALETTE[i % PALETTE.length] }} />
                    <span style={styles.catName}>{d.category_icon} {d.category_name}</span>
                    <div style={styles.barWrap}>
                      <div style={{ ...styles.barFill, width: `${d.pct * 100}%`, background: PALETTE[i % PALETTE.length] }} />
                    </div>
                    <span style={styles.catPct}>{Math.round(d.pct * 100)}%</span>
                    <span style={styles.catAmt}>{fmt(d.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Cashflow chart */}
        {cashflow.some(m => m.income > 0 || m.expense > 0) && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>תזרים 6 חודשים</h2>
            <CashflowChart data={cashflow} />
          </section>
        )}
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', background: C.card, borderBottom: `1px solid ${C.line}` },
  monthBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: C.muted, padding: '0 8px' },
  monthLabel: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, fontSize: '1rem' },
  kindRow: { display: 'flex', gap: 8, padding: '0.75rem 1rem', background: C.card, borderBottom: `1px solid ${C.line}` },
  kindBtn: { flex: 1, padding: '0.45rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.9rem' },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
  section: { background: C.card, borderRadius: 18, padding: '1rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', color: C.ink, margin: 0 },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem 0' },
  table: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 },
  tableRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 2px', borderRadius: 6 },
  dot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  catName: { flex: '0 0 auto', maxWidth: '30%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', color: C.ink },
  barWrap: { flex: 1, height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catPct: { fontSize: '0.72rem', color: C.muted, width: 28, textAlign: 'left', flexShrink: 0 },
  catAmt: { fontFamily: 'Heebo, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: C.ink, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
}
