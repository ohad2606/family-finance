// Takziv — main-screen redesign: the 3 variation screens
const V = window.TakzivDesignSystem_57976b
const { Card: VCard, MoneyAmount: VMoney } = V
const {
  Header: RHeader, MonthStrip: RMonth, OverAlert: ROver, CardShell: RShell,
  CategoryBar: RBar, CategoryTile: RTile, TxList: RTx, UpcomingList: RUp,
  DailyRing: RRing, QuickAddSheet: RSheet, Fab: RFab, rfmt: vfmt,
} = window
const { useState: vState } = React

function useSheet() {
  const [open, setOpen] = vState(false)
  const [extra, setExtra] = vState([])
  const add = ({ kind, amount }) => {
    setExtra(x => [{ id: 'n' + Date.now(), desc: kind === 'income' ? 'הכנסה חדשה' : 'הוצאה חדשה', icon: kind === 'income' ? '💼' : '🛒', date: 'הרגע', amount, kind }, ...x])
    setOpen(false)
  }
  return { open, setOpen, extra, add }
}

const Stack = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.5rem 1.15rem 0' }}>{children}</div>
)
const Screen = ({ children }) => <div className="scroll"><div style={{ paddingBottom: 90 }}>{children}</div></div>

// ============ Variation A — calm monthly + budgets ============
function MainA({ data }) {
  const s = useSheet()
  const tx = [...s.extra, ...data.transactions]
  return (
    <>
      <Screen>
        <RHeader name={data.user.name} />
        <Stack>
          <VCard tone="dark" radius="xl" style={{ padding: '1.3rem 1.3rem 1.1rem' }}>
            <p style={{ margin: 0, color: 'var(--on-dark-sub)', fontSize: '0.85rem' }}>פנוי להוצאה</p>
            <div style={{ margin: '0.15rem 0 0.1rem' }}><VMoney value={data.available} onDark size="2.5rem" weight="var(--fw-black)" /></div>
            <p style={{ margin: '0 0 0.9rem', color: 'var(--on-dark-faint)', fontSize: '0.74rem' }}>אחרי הוראות קבע ותשלומים קבועים</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: 'var(--on-dark-fill)', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.7rem' }}>
                <p style={{ margin: 0, color: 'var(--on-dark-sub)', fontSize: '0.66rem' }}>בערך ליום</p>
                <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.05rem', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>≈ {vfmt(data.perDay)}</p>
              </div>
              <div style={{ flex: 1, background: 'var(--on-dark-fill)', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.7rem' }}>
                <p style={{ margin: 0, color: 'var(--on-dark-sub)', fontSize: '0.66rem' }}>לסוף החודש</p>
                <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.05rem', color: '#fff' }}>{data.daysLeft} ימים</p>
              </div>
            </div>
          </VCard>

          <RMonth m={data.month} />
          <ROver data={data} />

          <RShell title="תקציב לפי קטגוריה" action="הכל">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {data.budgets.map(b => <RBar key={b.name} b={b} />)}
            </div>
          </RShell>

          <RShell><RUp upcoming={data.upcoming} /></RShell>
          <RShell title="תנועות אחרונות" action="הכל"><RTx transactions={tx} /></RShell>
        </Stack>
      </Screen>
      <RFab onClick={() => s.setOpen(true)} />
      {s.open && <RSheet data={data} onClose={() => s.setOpen(false)} onAdd={s.add} />}
    </>
  )
}

// ============ Variation B — daily dial first ============
function MainB({ data }) {
  const s = useSheet()
  const tx = [...s.extra, ...data.transactions]
  return (
    <>
      <Screen>
        <RHeader name={data.user.name} />
        <Stack>
          <VCard tone="dark" radius="xl" style={{ padding: '1.2rem 1.2rem 1rem' }}>
            <RRing allowance={data.todayAllowance} spent={data.todaySpent} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--on-dark-track)' }}>
              <span style={{ color: 'var(--on-dark-sub)', fontSize: '0.78rem' }}>פנוי עד סוף החודש</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <VMoney value={data.available} onDark size="1.2rem" weight="var(--fw-black)" />
                <span style={{ color: 'var(--on-dark-faint)', fontSize: '0.68rem' }}>· {data.daysLeft} ימים</span>
              </span>
            </div>
          </VCard>

          <RShell title="תקציב לפי קטגוריה" action="הכל">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {data.budgets.slice(0, 4).map(b => <RBar key={b.name} b={b} />)}
            </div>
          </RShell>

          <ROver data={data} />
          <RMonth m={data.month} />
          <RShell><RUp upcoming={data.upcoming} /></RShell>
          <RShell title="תנועות אחרונות" action="הכל"><RTx transactions={tx} /></RShell>
        </Stack>
      </Screen>
      <RFab onClick={() => s.setOpen(true)} />
      {s.open && <RSheet data={data} onClose={() => s.setOpen(false)} onAdd={s.add} />}
    </>
  )
}

// ============ Variation C — budget-led category grid ============
function MainC({ data }) {
  const s = useSheet()
  const tx = [...s.extra, ...data.transactions]
  return (
    <>
      <Screen>
        <RHeader name={data.user.name} />
        <Stack>
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '3px solid var(--brass)' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.74rem' }}>פנוי להוצאה</p>
              <VMoney value={data.available} size="1.7rem" weight="var(--fw-black)" />
            </div>
            <span style={{ background: 'var(--paper)', borderRadius: 'var(--radius-pill)', padding: '0.35rem 0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>≈ {vfmt(data.perDay)} / יום</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 2px 0.6rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', margin: 0 }}>תקציב החודש</h2>
              <span style={{ color: 'var(--brass)', fontWeight: 600, fontSize: '0.82rem' }}>הכל</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {data.budgets.map(b => <RTile key={b.name} b={b} />)}
            </div>
          </div>

          <RMonth m={data.month} />
          <RShell><RUp upcoming={data.upcoming} /></RShell>
          <RShell title="תנועות אחרונות" action="הכל"><RTx transactions={tx} /></RShell>
        </Stack>
      </Screen>
      <RFab onClick={() => s.setOpen(true)} />
      {s.open && <RSheet data={data} onClose={() => s.setOpen(false)} onAdd={s.add} />}
    </>
  )
}

Object.assign(window, { MainA, MainB, MainC })
