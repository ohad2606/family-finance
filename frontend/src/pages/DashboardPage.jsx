import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardSummary, getAccounts, getTransactions, getCashflow, getBudget, getUpcomingRecurring } from '../api/finance'
import AddTransactionSheet from '../components/AddTransactionSheet'
import AddAccountSheet from '../components/AddAccountSheet'
import CashflowChart from '../components/CashflowChart'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const ACCOUNT_LABELS = { checking: 'עו"ש', savings: 'חיסכון', cash: 'מזומן', credit: 'אשראי', investment: 'השקעות' }

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showTx, setShowTx] = useState(false)
  const [showAcc, setShowAcc] = useState(false)

  const thisMonthStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` })()

  const { data: summary, isLoading: sumLoading } = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummary })
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: transactions = [] } = useQuery({ queryKey: ['transactions', { limit: 10 }], queryFn: () => getTransactions({ limit: 10 }) })
  const { data: cashflow = [] } = useQuery({ queryKey: ['cashflow'], queryFn: () => getCashflow(6) })
  const { data: budget = [] } = useQuery({ queryKey: ['budget', thisMonthStr], queryFn: () => getBudget(thisMonthStr) })
  const { data: upcoming = [] } = useQuery({ queryKey: ['upcoming-recurring'], queryFn: () => getUpcomingRecurring(7) })

  const overBudget = budget.filter(b => b.planned > 0 && b.actual > b.planned)

  const thisMonth = new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>זוזים</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={styles.userName}>{user?.display_name}</span>
          <button style={styles.logoutBtn} onClick={signOut}>יציאה</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Net Worth */}
        <div style={styles.netWorthCard}>
          <p style={styles.netWorthLabel}>שווי נקי</p>
          <p style={styles.netWorthValue}>{sumLoading ? '...' : fmt(summary?.net_worth)}</p>
          <div style={styles.netWorthRow}>
            <span style={{ color: C.income }}>↑ {fmt(summary?.total_assets)} נכסים</span>
            <span style={{ color: C.expense }}>↓ {fmt(summary?.total_liabilities)} חובות</span>
          </div>
        </div>

        {/* Month summary */}
        <div style={styles.row}>
          <div style={{ ...styles.summaryCard, borderTop: `3px solid ${C.income}` }}>
            <p style={styles.summaryLabel}>הכנסות {thisMonth}</p>
            <p style={{ ...styles.summaryValue, color: C.income }}>{fmt(summary?.month_income)}</p>
          </div>
          <div style={{ ...styles.summaryCard, borderTop: `3px solid ${C.expense}` }}>
            <p style={styles.summaryLabel}>הוצאות {thisMonth}</p>
            <p style={{ ...styles.summaryValue, color: C.expense }}>{fmt(summary?.month_expense)}</p>
          </div>
        </div>

        {/* Budget alert */}
        {overBudget.length > 0 && (
          <div style={styles.alertBanner} onClick={() => navigate('/budget')}>
            <span style={{ fontSize: '1.1rem' }}>⚠</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700 }}>{overBudget.length} קטגוריות חרגו מהתקציב</span>
              <span style={{ color: C.expense, fontWeight: 400, fontSize: '0.82rem', marginRight: 6 }}>
                {overBudget.map(b => b.category_name).join(', ')}
              </span>
            </div>
            <span style={{ color: C.muted }}>›</span>
          </div>
        )}

        {/* Upcoming recurring */}
        {upcoming.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>עומד לחיוב — 7 ימים</h2>
              <button style={styles.addBtn} onClick={() => navigate('/recurring')}>הכל</button>
            </div>
            <div style={styles.txList}>
              {upcoming.map(r => {
                const daysLeft = Math.ceil((new Date(r.next_date) - new Date()) / 86400000)
                return (
                  <div key={r.id} style={styles.txRow}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.txDesc}>{r.description || r.category_name || '—'}</p>
                      <p style={styles.txMeta}>
                        {r.next_date} · {daysLeft <= 0 ? 'היום' : daysLeft === 1 ? 'מחר' : `עוד ${daysLeft} ימים`}
                      </p>
                    </div>
                    <p style={{ ...styles.txAmount, color: r.kind === 'income' ? C.income : C.expense }}>
                      {r.kind === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Cashflow chart */}
        {cashflow.some(m => m.income > 0 || m.expense > 0) && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>תזרים 6 חודשים</h2>
            <CashflowChart data={cashflow} />
          </section>
        )}

        {/* Accounts */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>חשבונות</h2>
            <button style={styles.addBtn} onClick={() => setShowAcc(true)}>+ הוסף</button>
          </div>
          {accounts.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>אין חשבונות עדיין</p>
              <button style={styles.emptyAction} onClick={() => setShowAcc(true)}>הוסף חשבון ראשון</button>
            </div>
          ) : (
            <div style={styles.accountsList}>
              {accounts.map(acc => (
                <div key={acc.id} style={styles.accountRow}>
                  <div>
                    <p style={styles.accountName}>{acc.name}</p>
                    <p style={styles.accountType}>{ACCOUNT_LABELS[acc.type] || acc.type}{acc.institution ? ` · ${acc.institution}` : ''}</p>
                  </div>
                  <p style={{ ...styles.accountBalance, color: acc.balance >= 0 ? C.ink : C.expense }}>
                    {fmt(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>תנועות אחרונות</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={styles.addBtn} onClick={() => navigate('/transactions')}>הכל</button>
              <button style={styles.addBtn} onClick={() => setShowTx(true)}>+ הוסף</button>
            </div>
          </div>
          {transactions.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyText}>אין תנועות עדיין</p>
              <button style={styles.emptyAction} onClick={() => setShowTx(true)}>הוסף תנועה ראשונה</button>
            </div>
          ) : (
            <div style={styles.txList}>
              {transactions.map(tx => (
                <div key={tx.id} style={styles.txRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.txDesc}>{tx.description || tx.category_name || '—'}</p>
                    <p style={styles.txMeta}>{tx.account_name} · {new Date(tx.transaction_date).toLocaleDateString('he-IL')}</p>
                  </div>
                  <p style={{ ...styles.txAmount, color: tx.kind === 'income' ? C.income : C.expense }}>
                    {tx.kind === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <button style={styles.fab} onClick={() => setShowTx(true)}>+</button>

      {showTx && <AddTransactionSheet onClose={() => setShowTx(false)} />}
      {showAcc && <AddAccountSheet onClose={() => setShowAcc(false)} />}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 120 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: C.ink, margin: 0 },
  userName: { color: C.muted, fontSize: '0.85rem' },
  logoutBtn: { padding: '0.35rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.muted, fontFamily: 'Assistant, sans-serif', fontSize: '0.8rem' },
  alertBanner: { background: '#FEF3C7', borderRadius: 14, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '1px solid #FCD34D' },
  main: { padding: '1.25rem', maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
  netWorthCard: { background: C.ink, borderRadius: 20, padding: '1.5rem', color: '#fff', textAlign: 'center' },
  netWorthLabel: { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' },
  netWorthValue: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2.2rem', margin: '0.25rem 0', fontVariantNumeric: 'tabular-nums' },
  netWorthRow: { display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem', marginTop: 4 },
  row: { display: 'flex', gap: '0.75rem' },
  summaryCard: { flex: 1, background: C.card, borderRadius: 16, padding: '1rem' },
  summaryLabel: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  summaryValue: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.3rem', margin: '0.25rem 0 0', fontVariantNumeric: 'tabular-nums' },
  section: { background: C.card, borderRadius: 18, padding: '1rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', color: C.ink, margin: '0 0 0.75rem' },
  addBtn: { padding: '0.3rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.85rem' },
  emptyCard: { textAlign: 'center', padding: '1.5rem 0' },
  emptyText: { color: C.muted, margin: '0 0 0.75rem', fontSize: '0.9rem' },
  emptyAction: { padding: '0.5rem 1.25rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  accountsList: { display: 'flex', flexDirection: 'column', gap: 2 },
  accountRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.line}` },
  accountName: { margin: 0, fontWeight: 600, color: C.ink, fontSize: '0.95rem' },
  accountType: { margin: 0, color: C.muted, fontSize: '0.78rem' },
  accountBalance: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', margin: 0, fontVariantNumeric: 'tabular-nums' },
  txList: { display: 'flex', flexDirection: 'column', gap: 2 },
  txRow: { display: 'flex', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.line}`, gap: 8 },
  txDesc: { margin: 0, fontWeight: 600, color: C.ink, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  txMeta: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  txAmount: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  fab: { position: 'fixed', bottom: 72, insetInlineEnd: 24, width: 56, height: 56, borderRadius: '50%', background: C.brass, color: '#fff', border: 'none', fontSize: '1.8rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,162,63,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300, lineHeight: 1 },
}
