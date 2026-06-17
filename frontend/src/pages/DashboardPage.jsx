import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardSummary, getAccounts, getTransactions, getCashflow, getBudget, getUpcomingRecurring, getNetWorthHistory, getFinancialHealth, getSpending, getSavings, getLoans, getBankSyncStatus, triggerBankSync } from '../api/finance'
import AddTransactionSheet from '../components/AddTransactionSheet'
import AddAccountSheet from '../components/AddAccountSheet'
import CashflowChart from '../components/CashflowChart'
import NetWorthChart from '../components/NetWorthChart'
import HealthCard from '../components/HealthCard'
import TakzivLogo from '../components/TakzivLogo'
import DonutChart from '../components/DonutChart'

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
  const { data: nwHistory = [] } = useQuery({ queryKey: ['networth-history'], queryFn: () => getNetWorthHistory(12) })
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: getFinancialHealth })
  const { data: spending = [] } = useQuery({ queryKey: ['spending', thisMonthStr], queryFn: () => getSpending(thisMonthStr, 'expense') })
  const { data: savingsGoals = [] } = useQuery({ queryKey: ['savings'], queryFn: getSavings })
  const { data: loans = [] } = useQuery({ queryKey: ['loans'], queryFn: getLoans })
  const { data: bankSyncData = { syncs: [], has_pending: false } } = useQuery({
    queryKey: ['bank-sync-status'],
    queryFn: getBankSyncStatus,
    staleTime: 30_000,
    refetchInterval: (query) => query.state.data?.has_pending ? 10_000 : false,
  })
  const bankSyncStatus = bankSyncData.syncs
  const bankSyncPending = bankSyncData.has_pending
  const [triggering, setTriggering] = useState(false)

  const overBudget = budget.filter(b => b.planned > 0 && b.actual > b.planned)

  const thisMonth = new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}><TakzivLogo size={30} /> תקציב</h1>
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
          {nwHistory.length >= 2 && (() => {
            const first = nwHistory[0].net_worth
            const last = nwHistory[nwHistory.length - 1].net_worth
            const delta = last - first
            const pct = first !== 0 ? Math.round((delta / Math.abs(first)) * 100) : null
            return (
              <div style={{ marginTop: 10 }}>
                <NetWorthChart data={nwHistory} />
                {pct !== null && (
                  <p style={{ textAlign: 'center', margin: '4px 0 0', fontSize: '0.78rem', color: delta >= 0 ? '#6EE7B7' : '#FCA5A5' }}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(pct)}% ב-12 חודשים
                  </p>
                )}
              </div>
            )
          })()}
        </div>

        {/* Financial Health */}
        <HealthCard health={health} />

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

        {/* Spending by category */}
        {spending.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>הוצאות לפי קטגוריה — {thisMonth}</h2>
              <button style={styles.addBtn} onClick={() => navigate('/analytics')}>פירוט</button>
            </div>
            <DonutChart data={spending} size={160} />
          </section>
        )}

        {/* Savings goals */}
        {savingsGoals.filter(g => !g.is_completed).length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>יעדי חיסכון</h2>
              <button style={styles.addBtn} onClick={() => navigate('/savings')}>הכל</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {savingsGoals.filter(g => !g.is_completed).slice(0, 3).map(g => {
                const pct = Math.min(g.pct * 100, 100)
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: C.ink, fontSize: '0.9rem' }}>{g.icon} {g.name}</span>
                      <span style={{ fontSize: '0.8rem', color: C.muted, fontFamily: 'Heebo', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(g.current_amount)} / {fmt(g.target_amount)}
                      </span>
                    </div>
                    <div style={{ background: C.line, borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{ background: g.color || C.brass, borderRadius: 6, height: 8, width: `${pct}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: '0.7rem', color: C.muted }}>{Math.round(pct)}%</span>
                      {g.months_left != null && (
                        <span style={{ fontSize: '0.7rem', color: C.muted }}>עוד {g.months_left} חודשים</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Loans */}
        {loans.filter(l => l.is_active).length > 0 && (() => {
          const activeLoans = loans.filter(l => l.is_active)
          const totalMonthly = activeLoans.reduce((s, l) => s + l.monthly_payment, 0)
          const totalRemaining = activeLoans.reduce((s, l) => s + l.balance_remaining, 0)
          const TYPE_ICONS = { mortgage: '🏠', personal: '💳', car: '🚗', student: '🎓', other: '📄' }
          return (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>הלוואות</h2>
                <button style={styles.addBtn} onClick={() => navigate('/loans')}>הכל</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 10px', borderBottom: `1px solid ${C.line}`, marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted }}>תשלום חודשי כולל</p>
                  <p style={{ margin: '2px 0 0', fontFamily: 'Heebo', fontWeight: 700, color: C.expense, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalMonthly)}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted }}>יתרה לפירעון</p>
                  <p style={{ margin: '2px 0 0', fontFamily: 'Heebo', fontWeight: 700, color: C.ink, fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalRemaining)}</p>
                </div>
              </div>
              {activeLoans.slice(0, 3).map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: '1rem' }}>{TYPE_ICONS[l.loan_type] || '📄'}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: C.ink }}>{l.name}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted }}>{l.months_remaining} חודשים נותרו</p>
                  </div>
                  <p style={{ margin: 0, fontFamily: 'Heebo', fontWeight: 700, fontSize: '0.88rem', color: C.expense, fontVariantNumeric: 'tabular-nums' }}>{fmt(l.monthly_payment)}/חד׳</p>
                </div>
              ))}
            </section>
          )
        })()}

        {/* Bank sync status */}
        {(bankSyncStatus.length > 0 || bankSyncPending) && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>עדכון בנקאי</h2>
              <button
                style={{ ...styles.addBtn, opacity: triggering || bankSyncPending ? 0.5 : 1 }}
                disabled={triggering || bankSyncPending}
                onClick={async () => {
                  setTriggering(true)
                  try { await triggerBankSync() } finally { setTriggering(false) }
                }}
              >
                {bankSyncPending ? '⟳ מסנכרן...' : triggering ? 'שולח...' : '↻ סנכרן עכשיו'}
              </button>
            </div>
            {bankSyncPending && (
              <div style={{ fontSize: '0.8rem', color: C.brass, marginBottom: 8 }}>
                ⟳ הסקרייפר הביתי יאסוף את הנתונים בדקה הקרובה...
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bankSyncStatus.map(s => {
                const SOURCE_LABELS = { isracard: 'ישראכרט', max: 'מקס', discount: 'דיסקונט' }
                const syncedAt = s.synced_at ? new Date(s.synced_at) : null
                const relTime = syncedAt ? (() => {
                  const diffMin = Math.round((Date.now() - syncedAt) / 60000)
                  if (diffMin < 60) return `לפני ${diffMin} דקות`
                  const diffH = Math.floor(diffMin / 60)
                  if (diffH < 24) return `לפני ${diffH} שעות`
                  return `לפני ${Math.floor(diffH / 24)} ימים`
                })() : null
                return (
                  <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'ok' ? C.income : C.expense, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: C.ink }}>{SOURCE_LABELS[s.source] || s.source}</span>
                    <span style={{ flex: 1, fontSize: '0.78rem', color: C.muted, textAlign: 'left' }}>
                      {s.status === 'ok'
                        ? `${s.txns_created} חדשות · ${s.txns_skipped} ידועות`
                        : s.error_message || 'שגיאה'}
                    </span>
                    {relTime && <span style={{ fontSize: '0.75rem', color: C.muted, whiteSpace: 'nowrap' }}>{relTime}</span>}
                  </div>
                )
              })}
            </div>
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
  logo: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: C.ink, margin: 0, display: 'flex', alignItems: 'center', gap: 8 },
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
