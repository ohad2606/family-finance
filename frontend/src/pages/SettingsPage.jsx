import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getAccounts, createAccount, updateAccount, deleteAccount,
} from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const ICONS = [
  '🛒','🏠','🚗','🏥','📚','🎭','👕','📱','💡','🛡️','🏦','📋',
  '💼','💰','✈️','🍕','☕','🎵','💊','🐾','🎁','🔧','⚽','🌿',
  '🎓','🏋️','🎮','🌊','🍼','🐕','🎪','🌴',
]
const COLORS = [
  '#2F6B4F','#C9A23F','#4A7FA5','#8B5CF6','#E07B30',
  '#B0573C','#1B879E','#6B746E','#9B4F8B','#3D7A5E',
]
const ACCOUNT_TYPES = [
  { value: 'checking',   label: 'עו״ש',     icon: '🏦' },
  { value: 'savings',    label: 'חיסכון',   icon: '💎' },
  { value: 'credit',     label: 'אשראי',    icon: '💳' },
  { value: 'investment', label: 'השקעות',  icon: '📈' },
  { value: 'cash',       label: 'מזומן',    icon: '💵' },
]

/* ─── Category sheet ─── */
function CategorySheet({ cat, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!cat?.id
  const [form, setForm] = useState({
    name: cat?.name ?? '',
    kind: cat?.kind ?? 'expense',
    icon: cat?.icon ?? '📋',
    color: cat?.color ?? C.muted,
  })

  const save = useMutation({
    mutationFn: () => isEdit ? updateCategory(cat.id, form) : createCategory(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); onClose() },
  })

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>
        <div style={s.handle} />
        <h2 style={s.sheetTitle}>{isEdit ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['expense', 'income'].map(k => (
            <button key={k}
              style={{ ...s.chip, ...(form.kind === k ? { background: k === 'income' ? C.income : C.expense, color: '#fff', borderColor: 'transparent' } : {}) }}
              onClick={() => setForm(f => ({ ...f, kind: k }))}>
              {k === 'expense' ? 'הוצאה' : 'הכנסה'}
            </button>
          ))}
        </div>

        <label style={s.label}>שם</label>
        <input style={s.input} value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="שם הקטגוריה" />

        <label style={s.label}>אייקון</label>
        <div style={s.iconGrid}>
          {ICONS.map(ico => (
            <button key={ico} onClick={() => setForm(f => ({ ...f, icon: ico }))}
              style={{ ...s.iconBtn, ...(form.icon === ico ? { background: C.brass + '33', borderColor: C.brass } : {}) }}>
              {ico}
            </button>
          ))}
        </div>

        <label style={s.label}>צבע</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {COLORS.map(col => (
            <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))}
              style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: form.color === col ? `3px solid ${C.ink}` : '2px solid transparent', cursor: 'pointer', outline: 'none', padding: 0 }} />
          ))}
        </div>

        <button style={{ ...s.saveBtn, opacity: !form.name ? 0.5 : 1 }}
          disabled={!form.name} onClick={() => save.mutate()}>
          {save.isPending ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  )
}

/* ─── Account sheet ─── */
function AccountSheet({ acc, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!acc?.id
  const [form, setForm] = useState({
    name: acc?.name ?? '',
    type: acc?.type ?? 'checking',
    institution: acc?.institution ?? '',
    opening_balance: acc?.opening_balance ?? 0,
  })

  const save = useMutation({
    mutationFn: () => isEdit
      ? updateAccount(acc.id, { name: form.name, institution: form.institution || null })
      : createAccount(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); onClose() },
  })

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>
        <div style={s.handle} />
        <h2 style={s.sheetTitle}>{isEdit ? 'עריכת חשבון' : 'חשבון חדש'}</h2>

        <label style={s.label}>שם</label>
        <input style={s.input} value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="לדוגמה: עו״ש לאומי" />

        {!isEdit && (
          <>
            <label style={s.label}>סוג</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {ACCOUNT_TYPES.map(t => (
                <button key={t.value}
                  style={{ ...s.chip, ...(form.type === t.value ? { background: C.ink, color: '#fff', borderColor: 'transparent' } : {}) }}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        <label style={s.label}>בנק / מוסד</label>
        <input style={s.input} value={form.institution}
          onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
          placeholder="לדוגמה: בנק לאומי" />

        {!isEdit && (
          <>
            <label style={s.label}>יתרת פתיחה (₪)</label>
            <input style={s.input} type="number" value={form.opening_balance}
              onChange={e => setForm(f => ({ ...f, opening_balance: parseFloat(e.target.value) || 0 }))}
              placeholder="0" />
          </>
        )}

        <button style={{ ...s.saveBtn, opacity: !form.name ? 0.5 : 1 }}
          disabled={!form.name} onClick={() => save.mutate()}>
          {save.isPending ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  )
}

/* ─── Categories tab ─── */
function CategoriesTab() {
  const qc = useQueryClient()
  const { data: cats = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const del = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setPendingDelete(null) },
  })

  const income = cats.filter(c => c.kind === 'income')
  const expense = cats.filter(c => c.kind === 'expense')

  const Row = ({ cat }) => (
    <div style={s.row}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.color ?? C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
        {cat.icon}
      </div>
      <span style={{ flex: 1, color: C.ink, fontSize: '0.95rem' }}>{cat.name}</span>
      {pendingDelete === cat.id ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setPendingDelete(null)} style={s.cancelBtn}>ביטול</button>
          <button onClick={() => del.mutate(cat.id)} style={s.deleteBtn}>
            {del.isPending ? '...' : 'מחיקה'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => setEditing(cat)} style={s.actionBtn}>✎</button>
          <button onClick={() => setPendingDelete(cat.id)} style={{ ...s.actionBtn, color: C.expense }}>✕</button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div style={s.groupLabel}>הכנסות</div>
      <div style={s.group}>{income.map(c => <Row key={c.id} cat={c} />)}</div>

      <div style={s.groupLabel}>הוצאות</div>
      <div style={s.group}>{expense.map(c => <Row key={c.id} cat={c} />)}</div>

      <button style={s.addBtn} onClick={() => setAdding(true)}>+ הוסף קטגוריה</button>

      {editing && <CategorySheet cat={editing} onClose={() => setEditing(null)} />}
      {adding && <CategorySheet cat={null} onClose={() => setAdding(false)} />}
    </>
  )
}

/* ─── Accounts tab ─── */
function AccountsTab() {
  const qc = useQueryClient()
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts })
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const del = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); setPendingDelete(null) },
  })

  const typeInfo = t => ACCOUNT_TYPES.find(x => x.value === t) ?? { icon: '🏦', label: t }

  return (
    <>
      <div style={s.group}>
        {accounts.map(acc => (
          <div key={acc.id} style={s.row}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              {typeInfo(acc.type).icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.ink, fontSize: '0.95rem', fontWeight: 600 }}>{acc.name}</div>
              {acc.institution && <div style={{ color: C.muted, fontSize: '0.75rem' }}>{acc.institution}</div>}
            </div>
            <span style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: acc.balance >= 0 ? C.income : C.expense, flexShrink: 0, marginInlineEnd: 6 }}>
              {fmt(acc.balance)}
            </span>
            {pendingDelete === acc.id ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPendingDelete(null)} style={s.cancelBtn}>ביטול</button>
                <button onClick={() => del.mutate(acc.id)} style={s.deleteBtn}>
                  {del.isPending ? '...' : 'מחיקה'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => setEditing(acc)} style={s.actionBtn}>✎</button>
                <button onClick={() => setPendingDelete(acc.id)} style={{ ...s.actionBtn, color: C.expense }}>✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button style={s.addBtn} onClick={() => setAdding(true)}>+ הוסף חשבון</button>

      {editing && <AccountSheet acc={editing} onClose={() => setEditing(null)} />}
      {adding && <AccountSheet acc={null} onClose={() => setAdding(false)} />}
    </>
  )
}

/* ─── Page ─── */
export default function SettingsPage({ onBack }) {
  const [tab, setTab] = useState('categories')

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>→</button>
        <h1 style={s.title}>הגדרות</h1>
      </header>

      <div style={s.tabBar}>
        {[{ id: 'categories', label: 'קטגוריות' }, { id: 'accounts', label: 'חשבונות' }].map(t => (
          <button key={t.id}
            style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={s.main}>
        {tab === 'categories' ? <CategoriesTab /> : <AccountsTab />}
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 100 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  tabBar: { display: 'flex', background: C.card, borderBottom: `1px solid ${C.line}`, padding: '0 1rem' },
  tab: { flex: 1, padding: '0.65rem 0', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: C.muted },
  tabActive: { color: C.brass, borderBottomColor: C.brass },
  main: { padding: '0.75rem 1rem', maxWidth: 600, margin: '0 auto' },
  groupLabel: { fontSize: '0.7rem', fontWeight: 700, color: C.muted, letterSpacing: 0.8, padding: '0.5rem 4px 0.2rem', marginTop: 6 },
  group: { background: C.card, borderRadius: 14, overflow: 'hidden', marginBottom: 6 },
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 0.85rem', borderBottom: `1px solid ${C.line}` },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', padding: '4px 7px', borderRadius: 6 },
  cancelBtn: { padding: '3px 10px', background: C.line, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', color: C.ink, fontFamily: 'Assistant, sans-serif' },
  deleteBtn: { padding: '3px 10px', background: C.expense, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', color: '#fff', fontFamily: 'Assistant, sans-serif' },
  addBtn: { width: '100%', marginTop: 8, padding: '0.75rem', background: C.card, border: `1px dashed ${C.line}`, borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 600, color: C.muted, fontSize: '0.9rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-end' },
  sheet: { background: C.card, borderRadius: '20px 20px 0 0', padding: '0.75rem 1.25rem 2.5rem', width: '100%', maxHeight: '88vh', overflowY: 'auto', boxSizing: 'border-box' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  sheetTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, marginBottom: 16, marginTop: 0 },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.muted, marginBottom: 5, letterSpacing: 0.3 },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, background: '#fff', marginBottom: 14, boxSizing: 'border-box', direction: 'rtl', outline: 'none' },
  chip: { padding: '0.35rem 0.8rem', border: `1px solid ${C.line}`, borderRadius: 20, background: 'transparent', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem', color: C.muted, fontWeight: 600 },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 14 },
  iconBtn: { padding: '5px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', textAlign: 'center', lineHeight: 1.4 },
  saveBtn: { width: '100%', padding: '0.8rem', background: C.ink, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', marginTop: 4 },
}
