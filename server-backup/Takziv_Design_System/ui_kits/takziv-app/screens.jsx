// Takziv UI kit — screens, composed from the design-system components + local charts
const DS = window.TakzivDesignSystem_57976b
const { Button, Card, MoneyAmount, Badge, Input, Select, Tabs, KindToggle, ProgressBar, SectionHeader, Logo } = DS
const { ScoreRing, NetWorthSparkline, CashflowChart, DonutChart, fmtILS } = window
const { useState } = React

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
)

// ---------- Login ----------
function LoginScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', boxSizing: 'border-box' }}>
      <Card shadow radius="2xl" style={{ width: '100%', maxWidth: 360, padding: '2.25rem 1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <Logo size={34} />
          <p style={{ color: 'var(--muted)', margin: '8px 0 0', fontSize: '0.9rem' }}>ניהול פיננסי משפחתי</p>
        </div>
        <Button as="a" variant="secondary" fullWidth style={{ background: '#fff', marginBottom: '1rem', cursor: 'pointer' }} onClick={onAuth}>
          <GoogleIcon /> המשך עם Google
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>או</span>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        <Tabs value={mode} onChange={setMode} style={{ marginBottom: '1.25rem' }}
          items={[{ value: 'login', label: 'כניסה' }, { value: 'register', label: 'הרשמה' }]} />
        <form onSubmit={e => { e.preventDefault(); onAuth() }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && <>
            <Input placeholder="שם תצוגה" defaultValue="דנה כהן" />
            <Input placeholder="שם משק הבית (למשל: משפחת כהן)" defaultValue="משפחת כהן" />
          </>}
          <Input type="email" placeholder="אימייל" defaultValue="dana@example.com" />
          <Input type="password" placeholder="סיסמה" defaultValue="password" />
          <Button variant="primary" fullWidth type="submit" style={{ marginTop: 4 }}>
            {mode === 'login' ? 'כניסה' : 'הרשמה'}
          </Button>
          {mode === 'login' && (
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', padding: '4px 0' }}>שכחתי סיסמה</button>
          )}
        </form>
      </Card>
    </div>
  )
}

// ---------- Financial health card ----------
const HEALTH_TONE = { excellent: 'excellent', good: 'good', fair: 'fair', poor: 'poor' }
const HEALTH_LABEL = { excellent: 'מעולה', good: 'טוב', fair: 'בינוני', poor: 'דרוש שיפור' }
const METRICS = [
  { key: 'savings_rate', icon: '💰', fmt: v => `${v}%`, tip: '20%+ מומלץ' },
  { key: 'budget_adherence', icon: '◎', fmt: v => `${v}%`, tip: '100% = מושלם' },
  { key: 'runway_months', icon: '🛟', fmt: v => `${v} חד׳`, tip: '6+ אידיאלי' },
  { key: 'debt_burden', icon: '🏦', fmt: v => `${v}%`, tip: 'מתחת ל-36%' },
]
function HealthCard({ health }) {
  const label = health.score >= 80 ? 'בריאות פיננסית מצוינת' : health.score >= 60 ? 'מצב טוב, יש מקום לשיפור' : 'נדרשת תשומת לב'
  return (
    <Card tone="dark" radius="xl" style={{ padding: '1.1rem 1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <ScoreRing score={health.score} />
        <div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--on-dark-sub)', fontWeight: 600, letterSpacing: 0.5 }}>בריאות פיננסית</p>
          <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{label}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {METRICS.map(m => {
          const d = health[m.key]
          return (
            <div key={m.key} style={{ background: 'var(--on-dark-fill)', borderRadius: 12, padding: '0.6rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--on-dark-sub)' }}>{m.icon} {d.label}</span>
                <Badge tone={HEALTH_TONE[d.status]} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>{HEALTH_LABEL[d.status]}</Badge>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', color: '#fff' }}>{m.fmt(d.value)}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--on-dark-faint)', marginTop: 1 }}>{m.tip}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- Add-transaction bottom sheet ----------
function AddTxSheet({ onClose, onAdd }) {
  const [kind, setKind] = useState('expense')
  const [amount, setAmount] = useState('')
  const D = window.TAKZIV_DATA
  const submit = e => {
    e.preventDefault()
    onAdd({ kind, amount: parseFloat(amount) || 0 })
  }
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'flex-end', zIndex: 100, animation: 'tz-fade 0.2s ease' }}>
      <div style={{ background: 'var(--card)', borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', fontFamily: 'var(--font-sans)', boxSizing: 'border-box', animation: 'tz-rise 0.28s ease' }}>
        <div style={{ width: 40, height: 4, background: 'var(--line)', borderRadius: 2, margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem', fontSize: '1.1rem' }}>הוסף תנועה</h2>
        <KindToggle value={kind} onChange={k => setKind(k)} style={{ marginBottom: '1rem' }} />
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="number" placeholder="0" min="0" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', textAlign: 'center', border: 'none', borderBottom: '2px solid var(--line)', background: 'transparent', color: 'var(--ink)', padding: '0.5rem', outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
          <Select defaultValue=""><option value="">בחר חשבון</option>{D.accountOptions.map(a => <option key={a}>{a}</option>)}</Select>
          <Select defaultValue=""><option value="">קטגוריה (אופציונלי)</option>{D.categoryOptions[kind].map(c => <option key={c}>{c}</option>)}</Select>
          <Input placeholder="תיאור (אופציונלי)" />
          <Button variant={kind === 'income' ? 'primary' : 'primary'} fullWidth type="submit"
            style={{ background: kind === 'income' ? 'var(--income)' : 'var(--expense)', boxShadow: 'none', marginTop: 4, borderRadius: 14 }}>שמור</Button>
        </form>
      </div>
    </div>
  )
}

// ---------- Dashboard ----------
function Dashboard({ data, onAddOpen, onSignOut, txExtra }) {
  const s = data.summary
  const nw = data.netWorthHistory
  const delta = nw[nw.length - 1] - nw[0]
  const pct = Math.round((delta / Math.abs(nw[0])) * 100)
  const transactions = [...txExtra, ...data.transactions]
  const totalMonthly = data.loans.reduce((a, l) => a + l.monthly_payment, 0)
  const totalRemaining = data.loans.reduce((a, l) => a + l.balance, 0)

  const Section = ({ title, action, onAction, children }) => (
    <Card radius="lg" style={{ padding: '1rem' }}>
      <SectionHeader title={title} actionLabel={action} onAction={onAction} />
      {children}
    </Card>
  )

  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)', paddingBottom: 96 }}>
      {/* Header */}
      <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <Logo size={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{data.user.display_name}</span>
          <Button variant="secondary" size="sm" onClick={onSignOut} style={{ color: 'var(--muted)', fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>יציאה</Button>
        </div>
      </header>

      <main style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Net worth */}
        <Card tone="dark" radius="xl" style={{ textAlign: 'center', padding: '1.4rem' }}>
          <p style={{ margin: 0, color: 'var(--on-dark-sub)', fontSize: '0.85rem' }}>שווי נקי</p>
          <div style={{ margin: '0.2rem 0' }}><MoneyAmount value={s.net_worth} onDark size="2.2rem" weight="var(--fw-black)" /></div>
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.82rem', marginTop: 4 }}>
            <span style={{ color: 'var(--on-dark-pos)' }}>↑ {fmtILS(s.total_assets)} נכסים</span>
            <span style={{ color: 'var(--on-dark-neg)' }}>↓ {fmtILS(s.total_liabilities)} חובות</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <NetWorthSparkline data={nw} />
            <p style={{ textAlign: 'center', margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--on-dark-pos)' }}>▲ {pct}% ב-12 חודשים</p>
          </div>
        </Card>

        <HealthCard health={data.health} />

        {/* Month summary */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Card accent="var(--income)" radius="lg" style={{ flex: 1, padding: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.75rem' }}>הכנסות יוני</p>
            <MoneyAmount value={s.month_income} kind="income" size="1.3rem" />
          </Card>
          <Card accent="var(--expense)" radius="lg" style={{ flex: 1, padding: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.75rem' }}>הוצאות יוני</p>
            <MoneyAmount value={s.month_expense} kind="expense" size="1.3rem" />
          </Card>
        </div>

        {/* Alert */}
        <div style={{ background: 'var(--alert-bg)', borderRadius: 14, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '1px solid var(--alert-border)' }}>
          <span style={{ fontSize: '1.1rem' }}>⚠</span>
          <div style={{ flex: 1, color: 'var(--alert-text)' }}>
            <span style={{ fontWeight: 700 }}>{data.overBudget.length} קטגוריה חרגה מהתקציב</span>
            <span style={{ fontSize: '0.82rem', marginRight: 6 }}>{data.overBudget.map(b => b.category_name).join(', ')}</span>
          </div>
          <span style={{ color: 'var(--muted)' }}>›</span>
        </div>

        {/* Upcoming */}
        <Section title="עומד לחיוב — 7 ימים" action="הכל">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.upcoming.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--line)', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem' }}>{r.description}</p>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.75rem' }}>{r.next_date} · {r.days <= 0 ? 'היום' : r.days === 1 ? 'מחר' : `עוד ${r.days} ימים`}</p>
                </div>
                <MoneyAmount value={r.amount} kind={r.kind} showSign size="0.95rem" />
              </div>
            ))}
          </div>
        </Section>

        {/* Cashflow */}
        <Section title="תזרים 6 חודשים"><CashflowChart data={data.cashflow} /></Section>

        {/* Spending */}
        <Section title="הוצאות לפי קטגוריה — יוני" action="פירוט"><DonutChart data={data.spending} size={160} /></Section>

        {/* Savings */}
        <Section title="יעדי חיסכון" action="הכל">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.savings.map(g => {
              const p = Math.min((g.current / g.target) * 100, 100)
              return (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem' }}>{g.icon} {g.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{fmtILS(g.current)} / {fmtILS(g.target)}</span>
                  </div>
                  <ProgressBar pct={p} color={g.color} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{Math.round(p)}%</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>עוד {g.months_left} חודשים</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Loans */}
        <Section title="הלוואות" action="הכל">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 10px', borderBottom: '1px solid var(--line)', marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--muted)' }}>תשלום חודשי כולל</p>
              <MoneyAmount value={totalMonthly} kind="expense" size="1.1rem" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--muted)' }}>יתרה לפירעון</p>
              <MoneyAmount value={totalRemaining} size="1.1rem" />
            </div>
          </div>
          {data.loans.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: '1rem' }}>{l.type}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>{l.name}</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--muted)' }}>{l.months_remaining} חודשים נותרו</p>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--expense)', fontVariantNumeric: 'tabular-nums' }}>{fmtILS(l.monthly_payment)}/חד׳</span>
            </div>
          ))}
        </Section>

        {/* Accounts */}
        <Section title="חשבונות" action="+ הוסף">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.accounts.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.95rem' }}>{a.name}</p>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.78rem' }}>{a.type}{a.institution ? ` · ${a.institution}` : ''}</p>
                </div>
                <MoneyAmount value={a.balance} kind={a.balance >= 0 ? 'neutral' : 'expense'} size="1rem" />
              </div>
            ))}
          </div>
        </Section>

        {/* Transactions */}
        <Section title="תנועות אחרונות" action="+ הוסף" onAction={onAddOpen}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {transactions.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid var(--line)', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</p>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.75rem' }}>{t.account} · {t.date}</p>
                </div>
                <MoneyAmount value={t.amount} kind={t.kind} showSign size="0.95rem" />
              </div>
            ))}
          </div>
        </Section>
      </main>

      {/* FAB */}
      <button onClick={onAddOpen} style={{ position: 'absolute', bottom: 20, insetInlineEnd: 20, width: 56, height: 56, borderRadius: '50%', background: 'var(--brass)', color: '#fff', border: 'none', fontSize: '1.8rem', cursor: 'pointer', boxShadow: 'var(--shadow-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 300, lineHeight: 1, zIndex: 20 }}>+</button>
    </div>
  )
}

Object.assign(window, { LoginScreen, Dashboard, AddTxSheet, HealthCard })
