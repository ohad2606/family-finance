import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMonthLedger, skipOccurrence } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', brass: '#C9A23F', income: '#2F6B4F', expense: '#B0573C',
}

const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const fmt = (n) => {
  if (n == null) return '—'
  return Math.abs(n).toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const fmtDay = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()}.${d.getMonth() + 1}`
}

function prevMonthStr(m) {
  const [y, mo] = m.split('-').map(Number)
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`
}
function nextMonthStr(m) {
  const [y, mo] = m.split('-').map(Number)
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`
}

function StatusChip({ row }) {
  let text, bg, color
  if (row.status === 'matched') {
    const matchDay = row.matched_date ? fmtDay(row.matched_date) : null
    const dueDay = row.date ? fmtDay(row.date) : null
    text = matchDay && matchDay !== dueDay ? `✓ ב-${matchDay}` : '✓ בוצע'
    bg = '#DCFCE7'; color = C.income
  } else if (row.status === 'actual') {
    text = '✓'; bg = '#DCFCE7'; color = C.income
  } else if (row.status === 'overdue') {
    text = 'באיחור'; bg = '#FEE2E2'; color = C.expense
  } else if (row.status === 'skipped') {
    text = 'דולג'; bg = '#F3F4F6'; color = C.muted
  } else if (row.source === 'card_billing') {
    text = 'חיוב צפוי'; bg = '#FEF3C7'; color = '#92400E'
  } else if (row.source === 'loan') {
    text = 'הלוואה'; bg = '#EDE9FE'; color = '#5B21B6'
  } else {
    text = 'ממתין'; bg = C.line; color = C.muted
  }
  return (
    <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: 20, background: bg, color, fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>
      {text}
    </span>
  )
}

function LedgerRowItem({ row, onSkip }) {
  const isIncome = row.amount > 0
  const isSkipped = row.status === 'skipped'
  const canSkip = row.source === 'expected' && row.status === 'pending' && row.occurrence_id

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0.6rem 0',
      borderBottom: `1px solid ${C.line}`,
      opacity: isSkipped ? 0.45 : 1,
    }}>
      {/* Description + chip (flex: 1, right side in RTL) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.88rem', color: C.ink, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: isSkipped ? 'line-through' : 'none',
        }}>
          {row.description || '—'}
        </span>
        <StatusChip row={row} />
      </div>

      {/* Day number (middle) */}
      <span style={{ color: C.muted, fontSize: '0.78rem', width: 22, textAlign: 'center', flexShrink: 0, fontFamily: 'Heebo, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
        {row.day}
      </span>

      {/* Amount (left side in RTL) */}
      <span style={{
        fontFamily: 'Heebo, sans-serif', fontVariantNumeric: 'tabular-nums',
        fontSize: '0.9rem', fontWeight: 700,
        color: isIncome ? C.income : C.expense,
        width: 86, textAlign: 'left', flexShrink: 0,
      }}>
        {isIncome ? '+' : '-'}{fmt(Math.abs(row.amount))} ₪
      </span>

      {/* Skip button for pending expected */}
      {canSkip && (
        <button onClick={() => onSkip(row.occurrence_id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.75rem', padding: '0 2px', flexShrink: 0 }}
          title="דלג החודש">✕</button>
      )}
    </div>
  )
}

export default function MonthLedger() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [month, setMonth] = useState(todayStr)

  const [y, mo] = month.split('-').map(Number)
  const monthLabel = `${HE_MONTHS[mo - 1]} ${y}`

  const { data, isLoading } = useQuery({
    queryKey: ['month-ledger', month],
    queryFn: () => getMonthLedger(month),
    staleTime: 60_000,
  })

  const skipMut = useMutation({
    mutationFn: skipOccurrence,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['month-ledger'] }),
  })

  const hasExpected = data?.rows?.some(r => r.source === 'expected')

  // Opening balance row: prefer bank_balance for display, opening_balance for label
  const displayBalance = data?.bank_balance ?? data?.opening_balance

  return (
    <div style={s.card}>
      {/* Header + navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h2 style={s.title}>תזרים החודש — {monthLabel}</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={s.navBtn} onClick={() => setMonth(prevMonthStr(month))}>‹</button>
          {month !== todayStr() && (
            <button style={s.navBtn} onClick={() => setMonth(todayStr())}>היום</button>
          )}
          <button style={s.navBtn} onClick={() => setMonth(nextMonthStr(month))}>›</button>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: C.muted, fontSize: '0.85rem' }}>טוען...</div>
      )}

      {!isLoading && data && (
        <>
          {/* Opening balance row */}
          {data.opening_account_name && (
            <div style={{ ...s.row, borderBottom: `1px solid ${C.line}`, paddingBottom: '0.6rem', marginBottom: 4 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: C.ink }}>{data.opening_account_name}</p>
                {data.bank_balance_at && (
                  <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: C.muted }}>
                    נכון ל-{fmtDay(data.bank_balance_at)}
                  </p>
                )}
              </div>
              <span style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: (displayBalance ?? 0) >= 0 ? C.ink : C.expense, fontVariantNumeric: 'tabular-nums' }}>
                {(displayBalance ?? 0) >= 0 ? '' : '-'}{fmt(displayBalance)} ₪
              </span>
            </div>
          )}

          {/* Empty state */}
          {!hasExpected && data.rows.length === 0 && (
            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ color: C.muted, fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                אין עדיין כללי זיהוי בנק
              </p>
              <p style={{ color: C.muted, fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
                הוסף "טקסט זיהוי בבנק" לכלל הוראת קבע כדי לעקוב אחרי תנועות אוטומטית
              </p>
              <button style={s.linkBtn} onClick={() => navigate('/recurring')}>
                עבור להוראות קבע ›
              </button>
            </div>
          )}

          {/* Table header */}
          {data.rows.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.25rem 0', marginBottom: 2 }}>
              <span style={{ flex: 1, fontSize: '0.68rem', color: C.muted }}>פעולה</span>
              <span style={{ fontSize: '0.68rem', color: C.muted, width: 22, textAlign: 'center' }}>יום</span>
              <span style={{ fontSize: '0.68rem', color: C.muted, width: 86, textAlign: 'left' }}>סכום</span>
              <span style={{ width: 18 }} />
            </div>
          )}

          {/* Rows */}
          {data.rows.map((row, i) => (
            <LedgerRowItem key={`${row.source}-${row.occurrence_id ?? row.transaction_id ?? i}`}
              row={row}
              onSkip={(id) => skipMut.mutate(id)}
            />
          ))}

          {/* Summary footer */}
          {data.summary && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `2px solid ${C.line}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 600 }}>צפי סוף חודש</span>
                <span style={{
                  fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.25rem',
                  fontVariantNumeric: 'tabular-nums',
                  color: data.summary.projected_end_balance >= 0 ? C.income : C.expense,
                }}>
                  {data.summary.projected_end_balance >= 0 ? '' : '-'}{fmt(data.summary.projected_end_balance)} ₪
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: C.income }}>
                  ↑ {fmt(data.summary.total_expected_income)} הכנסות
                </span>
                <span style={{ fontSize: '0.72rem', color: C.expense }}>
                  ↓ {fmt(data.summary.total_expected_expense)} הוצאות
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  card: {
    background: C.card, borderRadius: 18, padding: '1rem 1.25rem',
    fontFamily: 'Assistant, sans-serif', direction: 'rtl',
  },
  title: {
    fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem',
    color: C.ink, margin: 0,
  },
  navBtn: {
    background: C.paper, border: `1px solid ${C.line}`, borderRadius: 8,
    padding: '3px 10px', cursor: 'pointer', color: C.ink,
    fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem', fontWeight: 600,
  },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  linkBtn: {
    background: C.brass, color: '#fff', border: 'none', borderRadius: 10,
    padding: '0.5rem 1rem', cursor: 'pointer',
    fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.85rem',
  },
}
