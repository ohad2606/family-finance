import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getTransactions, deleteTransaction, getAccounts, getCategories } from '../api/finance'
import AddTransactionSheet from '../components/AddTransactionSheet'
import EditTransactionSheet from '../components/EditTransactionSheet'
import api from '../api/client'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const PAGE = 20

export default function TransactionsPage({ onBack }) {
  const qc = useQueryClient()
  const [urlParams] = useSearchParams()

  const [filters, setFilters] = useState({
    kind: urlParams.get('kind') ?? '',
    account_id: urlParams.get('account_id') ?? '',
    category_id: urlParams.get('category_id') ?? '',
    from_date: urlParams.get('from_date') ?? '',
    to_date: urlParams.get('to_date') ?? '',
    q: '',
  })
  const [page, setPage] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [exporting, setExporting] = useState(false)

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const serverParams = {
    limit: PAGE,
    offset: page * PAGE,
    ...(filters.kind && { kind: filters.kind }),
    ...(filters.account_id && { account_id: parseInt(filters.account_id) }),
    ...(filters.category_id && { category_id: parseInt(filters.category_id) }),
    ...(filters.from_date && { from_date: filters.from_date }),
    ...(filters.to_date && { to_date: filters.to_date }),
    ...(filters.q && { q: filters.q }),
  }

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', serverParams],
    queryFn: () => getTransactions(serverParams),
    keepPreviousData: true,
  })

  const deleteMut = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setConfirmDelete(null)
    },
  })

  const setFilter = k => e => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(0) }
  const hasFilters = filters.kind || filters.account_id || filters.category_id || filters.from_date || filters.to_date || filters.q
  const clearFilters = () => { setFilters({ kind: '', account_id: '', category_id: '', from_date: '', to_date: '', q: '' }); setPage(0) }

  const filteredCats = filters.kind ? categories.filter(c => c.kind === filters.kind) : categories

  // Group transactions by date
  const grouped = transactions.reduce((acc, tx) => {
    const d = tx.transaction_date
    if (!acc[d]) acc[d] = []
    acc[d].push(tx)
    return acc
  }, {})
  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const dateLabel = (dateStr) => {
    const today = new Date(); today.setHours(0,0,0,0)
    const d = new Date(dateStr + 'T00:00:00'); d.setHours(0,0,0,0)
    const diff = Math.round((today - d) / 86400000)
    if (diff === 0) return 'היום'
    if (diff === 1) return 'אתמול'
    return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  async function doExport() {
    setExporting(true)
    try {
      const exportParams = { ...serverParams }
      delete exportParams.limit
      delete exportParams.offset
      const qs = new URLSearchParams(Object.entries(exportParams).filter(([,v]) => v != null && v !== '')).toString()
      const resp = await api.get(`/transactions/export${qs ? '?' + qs : ''}`, { responseType: 'blob' })
      const url = URL.createObjectURL(resp.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `kaspi-${filters.from_date || 'all'}-${filters.to_date || 'all'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>→</button>
        <h1 style={styles.title}>תנועות</h1>
        <button style={styles.exportBtn} onClick={doExport} disabled={exporting} title="ייצוא CSV">
          {exporting ? '...' : '⬇ CSV'}
        </button>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+ הוסף</button>
      </header>

      {/* Filters */}
      <div style={styles.filtersWrap}>
        <input
          style={styles.searchInput}
          placeholder="🔍 חיפוש בתיאור..."
          value={filters.q}
          onChange={setFilter('q')}
        />
        <div style={styles.filterRow}>
          <select style={styles.filterSelect} value={filters.kind} onChange={setFilter('kind')}>
            <option value="">הכל</option>
            <option value="income">הכנסות</option>
            <option value="expense">הוצאות</option>
          </select>
          <select style={styles.filterSelect} value={filters.account_id} onChange={setFilter('account_id')}>
            <option value="">כל החשבונות</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select style={styles.filterSelect} value={filters.category_id} onChange={setFilter('category_id')}>
            <option value="">כל הקטגוריות</option>
            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div style={styles.filterRow}>
          <input style={styles.dateInput} type="date" value={filters.from_date} onChange={setFilter('from_date')} />
          <span style={{ color: C.muted, alignSelf: 'center', flexShrink: 0 }}>—</span>
          <input style={styles.dateInput} type="date" value={filters.to_date} onChange={setFilter('to_date')} />
          {hasFilters && (
            <button style={styles.clearBtn} onClick={clearFilters}>נקה</button>
          )}
        </div>
      </div>

      {/* List */}
      <main style={styles.main}>
        {isLoading ? (
          <p style={styles.empty}>טוען...</p>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.empty}>{hasFilters ? 'אין תנועות לפי הסינון' : 'אין תנועות'}</p>
            {!hasFilters && <button style={styles.emptyAction} onClick={() => setShowAdd(true)}>הוסף תנועה</button>}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groupedDates.map(dateStr => (
                <div key={dateStr}>
                  <p style={styles.dateHeader}>{dateLabel(dateStr)}</p>
                  <div style={styles.list}>
                    {grouped[dateStr].map(tx => (
                      <div key={tx.id} style={styles.row} onClick={() => setEditing(tx)}>
                        <div style={styles.rowIcon}>
                          <span style={{ fontSize: '1.1rem' }}>{tx.category_icon || (tx.kind === 'income' ? '💰' : '💸')}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={styles.desc}>{tx.description || tx.category_name || '—'}</p>
                          <p style={styles.meta}>{tx.account_name}{tx.category_name ? ` · ${tx.category_name}` : ''}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <p style={{ ...styles.amount, color: tx.kind === 'income' ? C.income : C.expense }}>
                            {tx.kind === 'income' ? '+' : '-'}{fmt(tx.amount)}
                          </p>
                          <button style={styles.deleteBtn} onClick={e => { e.stopPropagation(); setConfirmDelete(tx) }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.pagination}>
              <button style={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ הקודם</button>
              <span style={{ color: C.muted, fontSize: '0.85rem' }}>עמוד {page + 1}</span>
              <button style={styles.pageBtn} disabled={transactions.length < PAGE} onClick={() => setPage(p => p + 1)}>הבא ›</button>
            </div>
          </>
        )}
      </main>

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.dialog} onClick={e => e.stopPropagation()}>
            <p style={styles.dialogText}>למחוק את התנועה?</p>
            <p style={styles.dialogSub}>{confirmDelete.description || confirmDelete.category_name} · {fmt(confirmDelete.amount)}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>ביטול</button>
              <button style={styles.confirmBtn} disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(confirmDelete.id)}>
                {deleteMut.isPending ? '...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddTransactionSheet onClose={() => setShowAdd(false)} />}
      {editing && <EditTransactionSheet tx={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 40 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  exportBtn: { padding: '0.3rem 0.7rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.muted, fontFamily: 'Assistant, sans-serif', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' },
  addBtn: { padding: '0.3rem 0.8rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.brass, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Assistant, sans-serif', whiteSpace: 'nowrap' },
  filtersWrap: { padding: '0.75rem 1rem', background: C.card, borderBottom: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 8 },
  searchInput: { padding: '0.6rem 1rem', border: `1px solid ${C.line}`, borderRadius: 10, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.9rem', color: C.ink, textAlign: 'right', outline: 'none', width: '100%', boxSizing: 'border-box' },
  filterRow: { display: 'flex', gap: 8, alignItems: 'center' },
  filterSelect: { flex: 1, padding: '0.5rem 0.6rem', border: `1px solid ${C.line}`, borderRadius: 8, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.8rem', color: C.ink },
  dateInput: { flex: 1, padding: '0.5rem 0.6rem', border: `1px solid ${C.line}`, borderRadius: 8, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.8rem', color: C.ink },
  clearBtn: { padding: '0.4rem 0.75rem', border: 'none', borderRadius: 8, background: C.muted, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.78rem', whiteSpace: 'nowrap' },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  dateHeader: { margin: '0 0 4px 0', fontSize: '0.75rem', fontWeight: 700, color: C.muted, padding: '0 4px', textTransform: 'uppercase', letterSpacing: 0.5 },
  list: { background: C.card, borderRadius: 16, overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderBottom: `1px solid ${C.line}`, cursor: 'pointer' },
  rowIcon: { width: 36, height: 36, borderRadius: '50%', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  desc: { margin: 0, fontWeight: 600, color: C.ink, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { margin: 0, color: C.muted, fontSize: '0.75rem' },
  amount: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.95rem', margin: 0, fontVariantNumeric: 'tabular-nums' },
  deleteBtn: { background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4 },
  emptyCard: { textAlign: 'center', padding: '3rem 0' },
  empty: { color: C.muted, textAlign: 'center', padding: '2rem 0' },
  emptyAction: { padding: '0.5rem 1.25rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '0 4px' },
  pageBtn: { padding: '0.4rem 1rem', border: `1px solid ${C.line}`, borderRadius: 8, background: C.card, cursor: 'pointer', color: C.ink, fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  dialog: { background: C.card, borderRadius: 18, padding: '1.5rem', width: '100%', maxWidth: 320, fontFamily: 'Assistant, sans-serif' },
  dialogText: { margin: 0, fontWeight: 700, color: C.ink, fontSize: '1rem' },
  dialogSub: { margin: '6px 0 0', color: C.muted, fontSize: '0.85rem' },
  cancelBtn: { flex: 1, padding: '0.7rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600 },
  confirmBtn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: 10, background: C.expense, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700 },
}
