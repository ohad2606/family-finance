const C = {
  ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', card: '#F7F8F4',
  income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F', paper: '#E9EBE4',
}

const STATUS = {
  excellent: { color: '#2F6B4F', bg: '#D1FAE5', label: 'מעולה' },
  good:      { color: '#1B879E', bg: '#CFFAFE', label: 'טוב' },
  fair:      { color: '#B45309', bg: '#FEF3C7', label: 'בינוני' },
  poor:      { color: '#B0573C', bg: '#FEE2E2', label: 'דרוש שיפור' },
  'n/a':     { color: '#6B746E', bg: '#F3F4F6', label: 'אין נתונים' },
}

const METRICS = [
  { key: 'savings_rate',    icon: '💰', format: v => `${v}%`,   tip: '20%+ מומלץ' },
  { key: 'budget_adherence',icon: '◎',  format: v => `${v}%`,   tip: '100% = מושלם' },
  { key: 'runway_months',   icon: '🛟', format: v => `${v} חד׳`, tip: '6+ חודשים אידיאלי' },
  { key: 'debt_burden',     icon: '🏦', format: v => `${v}%`,   tip: 'מתחת ל-36%' },
]

function ScoreRing({ score }) {
  const R = 38, C_X = 44, C_Y = 44
  const circ = 2 * Math.PI * R
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#2F6B4F' : score >= 50 ? '#C9A23F' : '#B0573C'

  return (
    <div dir="ltr" style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={C_X} cy={C_Y} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
        <circle cx={C_X} cy={C_Y} r={R} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${C_X} ${C_Y})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.5rem', color: '#fff', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)' }}>מתוך 100</span>
      </div>
    </div>
  )
}

export default function HealthCard({ health }) {
  if (!health) return null
  const { score } = health
  const scoreLabel = score >= 80 ? 'בריאות פיננסית מצוינת' : score >= 60 ? 'מצב טוב, יש מקום לשיפור' : score >= 40 ? 'נדרשת תשומת לב' : 'מומלץ לפעול עכשיו'

  return (
    <div style={{ background: C.ink, borderRadius: 20, padding: '1.1rem 1.2rem', color: '#fff' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <ScoreRing score={score} />
        <div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.5 }}>בריאות פיננסית</p>
          <p style={{ margin: '2px 0 0', fontFamily: 'Heebo', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{scoreLabel}</p>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {METRICS.map(({ key, icon, format, tip }) => {
          const m = health[key]
          const st = STATUS[m.status]
          return (
            <div key={key} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.6rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{icon} {m.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: st.color, background: st.bg, padding: '1px 6px', borderRadius: 6 }}>{st.label}</span>
              </div>
              <div style={{ fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.15rem', color: '#fff' }}>
                {m.status === 'n/a' ? '—' : format(m.value)}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{tip}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
