// Takziv — main-screen redesign: 3 variations, composed from DS components.
const RD = window.TakzivDesignSystem_57976b
const { Card, Button, MoneyAmount, Badge, ProgressBar, Select, Input, KindToggle } = RD
const { useState } = React

const rfmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

function budgetMeta(b) {
  const pct = b.planned ? b.spent / b.planned : 0
  const remaining = b.planned - b.spent
  const over = remaining < 0
  const color = over ? 'var(--expense)' : pct > 0.85 ? 'var(--brass)' : 'var(--income)'
  return { pct: Math.min(pct * 100, 100), remaining, over, color }
}

// ---------- shared chrome ----------
function Header({ name }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.15rem 0.5rem' }}>
      <div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.8rem' }}>ערב טוב,</p>
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--ink)' }}>{name}</p>
      </div>
      <svg width="30" height="30" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
        <rect width="64" height="64" rx="14" fill="#1B2A27" />
        <polygon points="32,14 50,32 14,32" fill="#C9A23F" />
        <rect x="18" y="31" width="28" height="17" rx="1" fill="#C9A23F" fillOpacity="0.18" stroke="#C9A23F" strokeWidth="2" />
        <text x="32" y="43" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="bold" fill="#C9A23F">₪</text>
      </svg>
    </header>
  )
}

function MonthStrip({ m }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1, background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.85rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.72rem' }}>הכנסות החודש</p>
        <MoneyAmount value={m.income} kind="income" size="1.05rem" />
      </div>
      <div style={{ flex: 1, background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.85rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.72rem' }}>הוצאות החודש</p>
        <MoneyAmount value={m.expense} kind="expense" size="1.05rem" />
      </div>
    </div>
  )
}

function OverAlert({ data }) {
  const over = data.budgets.find(b => b.spent > b.planned)
  if (!over) return null
  const by = over.spent - over.planned
  return (
    <div style={{ background: 'var(--alert-bg)', border: '1px solid var(--alert-border)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--alert-text)' }}>
      <span style={{ fontSize: '1rem' }}>⚠</span>
      <span style={{ flex: 1, fontSize: '0.82rem' }}><b style={{ fontWeight: 700 }}>{over.icon} {over.name}</b> חרגו ב־{rfmt(by)}</span>
      <span style={{ opacity: 0.6 }}>›</span>
    </div>
  )
}

function CardShell({ title, action, children, pad = '0.9rem 1rem' }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: pad }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', margin: 0 }}>{title}</h2>
          {action && <span style={{ color: 'var(--brass)', fontWeight: 600, fontSize: '0.82rem' }}>{action}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

function CategoryBar({ b }) {
  const m = budgetMeta(b)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.88rem' }}>{b.icon} {b.name}</span>
        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: m.over ? 'var(--expense)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {m.over ? `חריגה ${rfmt(-m.remaining)}` : `נשאר ${rfmt(m.remaining)}`}
        </span>
      </div>
      <ProgressBar pct={m.pct} color={m.color} height={7} />
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 3 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{rfmt(b.spent)} / {rfmt(b.planned)}</span>
      </div>
    </div>
  )
}

function CategoryTile({ b }) {
  const m = budgetMeta(b)
  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-md)', padding: '0.8rem 0.85rem', borderTop: `3px solid ${m.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: '1rem' }}>{b.icon}</span>
        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.82rem' }}>{b.name}</span>
      </div>
      <p style={{ margin: '0 0 2px', fontSize: '0.66rem', color: 'var(--muted)' }}>{m.over ? 'חריגה' : 'נשאר'}</p>
      <div style={{ marginBottom: 7 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', color: m.over ? 'var(--expense)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {rfmt(Math.abs(m.remaining))}
        </span>
      </div>
      <ProgressBar pct={m.pct} color={m.color} height={6} />
      <p style={{ margin: '5px 0 0', fontSize: '0.64rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{rfmt(b.spent)} / {rfmt(b.planned)}</p>
    </div>
  )
}

function TxList({ transactions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {transactions.map((t, i) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0', borderBottom: i < transactions.length - 1 ? '1px solid var(--line)' : 'none' }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>{t.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</p>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.72rem' }}>{t.date}</p>
          </div>
          <MoneyAmount value={t.amount} kind={t.kind} showSign size="0.92rem" />
        </div>
      ))}
    </div>
  )
}

function UpcomingList({ upcoming }) {
  const total = upcoming.reduce((s, u) => s + u.amount, 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', margin: 0 }}>עומד לחיוב · 7 ימים</h2>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--expense)', fontVariantNumeric: 'tabular-nums' }}>{rfmt(total)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {upcoming.map((u, i) => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.45rem 0', borderBottom: i < upcoming.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ fontSize: '0.95rem' }}>{u.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.85rem' }}>{u.name}</p>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.72rem' }}>{u.date} · {u.days <= 1 ? 'מחר' : `עוד ${u.days} ימים`}</p>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{rfmt(u.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- daily ring (variation B) ----------
function DailyRing({ allowance, spent }) {
  const remaining = Math.max(allowance - spent, 0)
  const frac = Math.min(spent / allowance, 1)
  const R = 52, cx = 64, cy = 64, circ = 2 * Math.PI * R
  return (
    <div dir="ltr" style={{ position: 'relative', width: 128, height: 128, margin: '0 auto' }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#6EE7B7" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${(1 - frac) * circ} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--on-dark-sub)' }}>נשאר להיום</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.7rem', color: '#fff', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{rfmt(remaining)}</span>
        <span style={{ fontSize: '0.58rem', color: 'var(--on-dark-faint)' }}>מתוך {rfmt(allowance)}</span>
      </div>
    </div>
  )
}

// ---------- quick-add bottom sheet ----------
function QuickAddSheet({ data, onClose, onAdd }) {
  const [kind, setKind] = useState('expense')
  const [amount, setAmount] = useState('')
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'flex-end', zIndex: 100, animation: 'tz-fade 0.2s ease' }}>
      <div style={{ background: 'var(--card)', borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 1.75rem', width: '100%', boxSizing: 'border-box', animation: 'tz-rise 0.28s ease' }}>
        <div style={{ width: 40, height: 4, background: 'var(--line)', borderRadius: 2, margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 0.9rem', fontSize: '1.05rem' }}>הוסף הוצאה</h2>
        <KindToggle value={kind} onChange={setKind} style={{ marginBottom: '0.9rem' }} />
        <form onSubmit={e => { e.preventDefault(); onAdd({ kind, amount: parseFloat(amount) || 0 }) }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="number" placeholder="0" min="0" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: '2px solid var(--line)', background: 'transparent', color: 'var(--ink)', padding: '0.4rem', outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
          <Select defaultValue="">{['בחר קטגוריה', ...data.categoryOptions].map((c, i) => <option key={c} value={i ? c : ''}>{c}</option>)}</Select>
          <Select defaultValue="">{['חשבון', ...data.accountOptions].map((c, i) => <option key={c} value={i ? c : ''}>{c}</option>)}</Select>
          <Input placeholder="תיאור (אופציונלי)" />
          <Button variant="primary" fullWidth type="submit" style={{ background: kind === 'income' ? 'var(--income)' : 'var(--expense)', boxShadow: 'none', borderRadius: 14, marginTop: 2 }}>שמור</Button>
        </form>
      </div>
    </div>
  )
}

function Fab({ onClick }) {
  return <button onClick={onClick} style={{ position: 'absolute', bottom: 18, insetInlineEnd: 18, width: 56, height: 56, borderRadius: '50%', background: 'var(--brass)', color: '#fff', border: 'none', fontSize: '1.8rem', cursor: 'pointer', boxShadow: 'var(--shadow-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300, lineHeight: 1, zIndex: 20 }}>+</button>
}

Object.assign(window, {
  rfmt, budgetMeta, Header, MonthStrip, OverAlert, CardShell, CategoryBar, CategoryTile,
  TxList, UpcomingList, DailyRing, QuickAddSheet, Fab,
})
