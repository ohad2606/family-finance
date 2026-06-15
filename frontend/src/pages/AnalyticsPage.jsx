import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSpending, getCashflow, getAnnualReport } from '../api/finance'
import DonutChart from '../components/DonutChart'
import CashflowChart from '../components/CashflowChart'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)
const fmtPct = n => `${Math.round((n ?? 0) * 100)}%`

const MONTH_NAMES = ['ינו׳','פבר׳','מרץ','אפר׳','מאי','יוני','יולי','אוג׳','ספט׳','אוק׳','נוב׳','דצמ׳']

function toMonthStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }
function monthLabel(str) { return new Date(str+'T12:00:00').toLocaleDateString('he-IL',{month:'long',year:'numeric'}) }
function prevMonth(str) { const d=new Date(str+'T12:00:00'); d.setMonth(d.getMonth()-1); return toMonthStr(d) }
function nextMonth(str) { const d=new Date(str+'T12:00:00'); d.setMonth(d.getMonth()+1); return toMonthStr(d) }

const PALETTE = ['#2F6B4F','#C9A23F','#4A7FA5','#8B5CF6','#E07B30','#B0573C','#1B879E','#6B746E']

/* ─── Annual bar chart ─── */
function AnnualBarChart({ months }) {
  const max = Math.max(...months.map(m => Math.max(m.income, m.expense)), 1)
  const W = 320, H = 140, BAR_W = 10, GAP = 4, GROUP = BAR_W * 2 + GAP + 8
  const total_w = GROUP * 12
  const x_offset = (W - total_w) / 2

  return (
    <div style={{ overflowX: 'auto' }}>
      <div dir="ltr">
        <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', maxWidth: 520, display: 'block', margin: '0 auto' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f} stroke={C.line} strokeWidth={0.5} />
          ))}
          {months.map((m, i) => {
            const x = x_offset + i * GROUP
            const ih = (m.income / max) * H
            const eh = (m.expense / max) * H
            const mo = parseInt(m.month.split('-')[1]) - 1
            return (
              <g key={m.month}>
                <rect x={x} y={H - ih} width={BAR_W} height={ih} fill={C.income} rx={2} opacity={0.85} />
                <rect x={x + BAR_W + 2} y={H - eh} width={BAR_W} height={eh} fill={C.expense} rx={2} opacity={0.85} />
                <text x={x + BAR_W + 1} y={H + 16} textAnchor="middle" fill={C.muted} fontSize={7}>{MONTH_NAMES[mo]}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
        {[['הכנסות', C.income], ['הוצאות', C.expense]].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: '0.75rem', color: C.muted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Monthly tab ─── */
function MonthlyTab() {
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
    <>
      <div style={s.monthNav}>
        <button style={s.navBtn} onClick={() => setMonth(prevMonth(month))}>‹</button>
        <span style={s.monthLabel}>{monthLabel(month)}</span>
        <button style={s.navBtn} onClick={() => setMonth(nextMonth(month))}>›</button>
      </div>
      <div style={s.kindRow}>
        {['expense','income'].map(k => (
          <button key={k}
            style={{ ...s.kindBtn, ...(kind===k ? {background: k==='income' ? C.income : C.expense, color:'#fff', borderColor:'transparent'} : {}) }}
            onClick={() => setKind(k)}>
            {k==='income' ? 'הכנסות' : 'הוצאות'}
          </button>
        ))}
      </div>
      <main style={s.main}>
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>{kind==='expense'?'הוצאות':'הכנסות'} לפי קטגוריה</h2>
            <span style={{fontFamily:'Heebo',fontWeight:700,color:kind==='expense'?C.expense:C.income}}>{fmt(total)}</span>
          </div>
          {isLoading ? <p style={s.empty}>טוען...</p>
          : spending.length===0 ? <p style={s.empty}>אין נתונים לחודש זה</p>
          : (
            <>
              <DonutChart data={spending} size={220} />
              <div style={s.table}>
                {spending.map((d,i) => (
                  <div key={d.category_id??i} style={s.tableRow}
                    onClick={() => navigate(`/transactions?category_id=${d.category_id}&from_date=${month}&to_date=${nextMonth(month).replace('-01','')}&kind=${kind}`)}>
                    <div style={{...s.dot,background:PALETTE[i%PALETTE.length]}} />
                    <span style={s.catName}>{d.category_icon} {d.category_name}</span>
                    <div style={s.barWrap}><div style={{...s.barFill,width:`${d.pct*100}%`,background:PALETTE[i%PALETTE.length]}} /></div>
                    <span style={s.catPct}>{Math.round(d.pct*100)}%</span>
                    <span style={s.catAmt}>{fmt(d.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
        {cashflow.some(m=>m.income>0||m.expense>0) && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>תזרים 6 חודשים</h2>
            <CashflowChart data={cashflow} />
          </section>
        )}
      </main>
    </>
  )
}

/* ─── Annual tab ─── */
function AnnualTab() {
  const navigate = useNavigate()
  const [year, setYear] = useState(new Date().getFullYear())
  const thisYear = new Date().getFullYear()

  const { data: report, isLoading } = useQuery({
    queryKey: ['annual', year],
    queryFn: () => getAnnualReport(year),
  })

  const hasData = report && (report.total_income > 0 || report.total_expense > 0)

  return (
    <>
      {/* Year nav */}
      <div style={s.monthNav}>
        <button style={s.navBtn} onClick={() => setYear(y => y - 1)}>‹</button>
        <span style={s.monthLabel}>{year}</span>
        <button style={s.navBtn} onClick={() => setYear(y => y + 1)} disabled={year >= thisYear}>›</button>
      </div>

      <main style={s.main}>
        {isLoading ? (
          <p style={s.empty}>טוען...</p>
        ) : !hasData ? (
          <p style={s.empty}>אין נתונים לשנה זו</p>
        ) : (
          <>
            {/* Summary cards */}
            <div style={s.summaryGrid}>
              <div style={{ ...s.summaryCard, borderTop: `3px solid ${C.income}` }}>
                <p style={s.summaryLabel}>הכנסות</p>
                <p style={{ ...s.summaryVal, color: C.income }}>{fmt(report.total_income)}</p>
              </div>
              <div style={{ ...s.summaryCard, borderTop: `3px solid ${C.expense}` }}>
                <p style={s.summaryLabel}>הוצאות</p>
                <p style={{ ...s.summaryVal, color: C.expense }}>{fmt(report.total_expense)}</p>
              </div>
            </div>

            {/* Net + savings rate */}
            <div style={s.netCard}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>מאזן שנתי</p>
                <p style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.8rem', margin: '2px 0', color: report.net >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
                  {report.net >= 0 ? '+' : ''}{fmt(report.net)}
                </p>
              </div>
              {report.savings_rate > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>שיעור חיסכון</p>
                  <p style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.8rem', margin: '2px 0', color: '#6EE7B7' }}>
                    {fmtPct(report.savings_rate)}
                  </p>
                </div>
              )}
            </div>

            {/* 12-month bar chart */}
            <section style={s.section}>
              <h2 style={s.sectionTitle}>תזרים חודשי {year}</h2>
              <AnnualBarChart months={report.months} />
            </section>

            {/* Monthly breakdown table */}
            <section style={s.section}>
              <h2 style={s.sectionTitle}>פירוט חודשי</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.mTable}>
                  <thead>
                    <tr>
                      <th style={s.mTh}>חודש</th>
                      <th style={{ ...s.mTh, color: C.income }}>הכנסות</th>
                      <th style={{ ...s.mTh, color: C.expense }}>הוצאות</th>
                      <th style={s.mTh}>מאזן</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.months.map((m, i) => {
                      const net = m.income - m.expense
                      const isCurrentMonth = m.month === toMonthStr(new Date()).slice(0, 7)
                      return (
                        <tr key={m.month} style={{ background: isCurrentMonth ? C.brass + '18' : 'transparent' }}
                          onClick={() => navigate(`/transactions?from_date=${m.month}-01&to_date=${m.month}-28&kind=`)}
                          style={{ cursor: 'pointer', background: isCurrentMonth ? C.brass+'18':'transparent' }}>
                          <td style={s.mTd}>{MONTH_NAMES[i]}</td>
                          <td style={{ ...s.mTd, color: C.income, fontFamily: 'Heebo', fontWeight: 600 }}>{m.income > 0 ? fmt(m.income) : '—'}</td>
                          <td style={{ ...s.mTd, color: C.expense, fontFamily: 'Heebo', fontWeight: 600 }}>{m.expense > 0 ? fmt(m.expense) : '—'}</td>
                          <td style={{ ...s.mTd, color: net >= 0 ? C.income : C.expense, fontFamily: 'Heebo', fontWeight: 700 }}>
                            {m.income === 0 && m.expense === 0 ? '—' : (net >= 0 ? '+' : '') + fmt(net)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Top expense categories */}
            {report.top_expenses.length > 0 && (
              <section style={s.section}>
                <h2 style={s.sectionTitle}>הוצאות גדולות {year}</h2>
                <div style={s.table}>
                  {report.top_expenses.map((d, i) => (
                    <div key={d.category_id ?? i} style={s.tableRow}>
                      <div style={{ ...s.dot, background: PALETTE[i % PALETTE.length] }} />
                      <span style={s.catName}>{d.category_icon} {d.category_name}</span>
                      <div style={s.barWrap}><div style={{ ...s.barFill, width: `${d.pct*100}%`, background: PALETTE[i%PALETTE.length] }} /></div>
                      <span style={s.catPct}>{Math.round(d.pct * 100)}%</span>
                      <span style={s.catAmt}>{fmt(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

/* ─── Page wrapper ─── */
export default function AnalyticsPage({ onBack }) {
  const [tab, setTab] = useState('monthly')

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>→</button>
        <h1 style={s.title}>ניתוח</h1>
      </header>

      <div style={s.tabBar}>
        {[{id:'monthly',label:'חודשי'},{id:'annual',label:'שנתי'}].map(t => (
          <button key={t.id}
            style={{ ...s.tab, ...(tab===t.id ? s.tabActive : {}) }}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'monthly' ? <MonthlyTab /> : <AnnualTab />}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  tabBar: { display: 'flex', background: C.card, borderBottom: `1px solid ${C.line}`, padding: '0 1rem' },
  tab: { flex: 1, padding: '0.65rem 0', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: C.muted },
  tabActive: { color: C.brass, borderBottomColor: C.brass },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', background: C.card, borderBottom: `1px solid ${C.line}` },
  navBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: C.muted, padding: '0 8px' },
  monthLabel: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, fontSize: '1rem' },
  kindRow: { display: 'flex', gap: 8, padding: '0.75rem 1rem', background: C.card, borderBottom: `1px solid ${C.line}` },
  kindBtn: { flex: 1, padding: '0.45rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.9rem' },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
  section: { background: C.card, borderRadius: 18, padding: '1rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', color: C.ink, margin: '0 0 0.75rem' },
  empty: { color: C.muted, textAlign: 'center', padding: '3rem 0' },
  summaryGrid: { display: 'flex', gap: 10 },
  summaryCard: { flex: 1, background: C.card, borderRadius: 16, padding: '0.9rem 1rem' },
  summaryLabel: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  summaryVal: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.2rem', margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' },
  netCard: { background: C.ink, borderRadius: 18, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' },
  table: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 },
  tableRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 2px', borderRadius: 6 },
  dot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  catName: { flex: '0 0 auto', maxWidth: '30%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', color: C.ink },
  barWrap: { flex: 1, height: 6, background: C.line, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catPct: { fontSize: '0.72rem', color: C.muted, width: 28, textAlign: 'left', flexShrink: 0 },
  catAmt: { fontFamily: 'Heebo, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: C.ink, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  mTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', direction: 'rtl' },
  mTh: { padding: '6px 8px', color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.line}`, textAlign: 'right', fontFamily: 'Heebo', fontSize: '0.78rem' },
  mTd: { padding: '7px 8px', color: C.ink, borderBottom: `1px solid ${C.line}`, textAlign: 'right' },
}
