import { useNavigate } from 'react-router-dom'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const FEATURES = [
  { icon: '◑', title: 'תמונה כלכלית שלמה', body: 'חשבונות, הלוואות, יעדי חיסכון ותזרים — הכל במסך אחד.' },
  { icon: '◎', title: 'תקציב חכם', body: 'הגדר תקציב חודשי לכל קטגוריה וקבל התראה ברגע שחורגים.' },
  { icon: '↺', title: 'תשלומים חוזרים', body: 'שכירות, מנויים, משכורת — נרשמים אוטומטית כל חודש.' },
  { icon: '👨‍👩‍👧', title: 'ניהול משפחתי', body: 'הזמן בן/בת זוג לצפות ולערוך יחד, עם הרשאות נפרדות.' },
  { icon: '◉', title: 'ציון בריאות פיננסית', body: 'אלגוריתם שמחשב את מצבך הפיננסי ומסביר איך להשתפר.' },
  { icon: '⬆', title: 'ייבוא מהבנק', body: 'העלה קובץ CSV מהבנק ותנועות יסווגו אוטומטית.' },
]

const SCREENS = [
  { label: 'דשבורד', color: C.ink },
  { label: 'תקציב', color: C.income },
  { label: 'ניתוח', color: C.brass },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={s.page}>
      {/* Nav */}
      <header style={s.nav}>
        <span style={s.navLogo}>כספי</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.navBtn} onClick={() => navigate('/login')}>כניסה</button>
          <button style={s.navCta} onClick={() => navigate('/login?mode=register')}>התחל בחינם</button>
        </div>
      </header>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <p style={s.heroEyebrow}>ניהול פיננסי משפחתי</p>
          <h1 style={s.heroTitle}>הכסף שלך,<br />בשליטה שלך</h1>
          <p style={s.heroSub}>
            כספי עוזר לך ולמשפחתך לעקוב אחרי הכנסות והוצאות,
            לעמוד בתקציב ולבנות עתיד פיננסי יציב — בפשטות.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={s.heroCta} onClick={() => navigate('/login?mode=register')}>
              התחל בחינם — ללא כרטיס אשראי
            </button>
            <a href="/api/auth/google" style={s.heroGoogle}>
              <GoogleIcon />
              <span>המשך עם Google</span>
            </a>
          </div>
        </div>

        {/* Mock phone */}
        <div style={s.phone}>
          <div style={s.phoneScreen}>
            <div style={{ background: C.ink, borderRadius: '12px 12px 0 0', padding: '10px 14px' }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem' }}>שווי נקי</p>
              <p style={{ margin: '2px 0 0', color: '#fff', fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.3rem' }}>₪127,430</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.55rem', marginTop: 4 }}>
                <span style={{ color: '#6EE7B7' }}>↑ ₪158,000 נכסים</span>
                <span style={{ color: '#FCA5A5' }}>↓ ₪30,570 חובות</span>
              </div>
            </div>
            <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'הכנסות יוני', val: '₪14,200', color: C.income },
                { label: 'הוצאות יוני', val: '₪9,840', color: C.expense },
              ].map(r => (
                <div key={r.label} style={{ background: C.card, borderRadius: 8, padding: '6px 8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.6rem', color: C.muted }}>{r.label}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: r.color, fontFamily: 'Heebo' }}>{r.val}</span>
                </div>
              ))}
              <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '5px 8px', fontSize: '0.58rem', color: '#92400E', fontWeight: 600 }}>
                ⚠ מסעדות חרגו מהתקציב
              </div>
              {[
                { desc: 'משכורת', acc: 'עו"ש', amt: '+₪14,200', c: C.income },
                { desc: 'שכירות', acc: 'עו"ש', amt: '-₪3,800', c: C.expense },
                { desc: 'סופר', acc: 'אשראי', amt: '-₪520', c: C.expense },
              ].map(t => (
                <div key={t.desc} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 600, color: C.ink }}>{t.desc}</p>
                    <p style={{ margin: 0, fontSize: '0.55rem', color: C.muted }}>{t.acc}</p>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: t.c, fontFamily: 'Heebo' }}>{t.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={s.featuresSection}>
        <h2 style={s.sectionTitle}>כל מה שצריך לניהול כספים משפחתי</h2>
        <div style={s.featuresGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featureCard}>
              <span style={s.featureIcon}>{f.icon}</span>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section style={s.statsStrip}>
        {[
          { num: '100%', label: 'פרטי — לא מוכרים נתונים' },
          { num: '∞', label: 'חשבונות וקטגוריות' },
          { num: '30', label: 'יום refresh token' },
          { num: '0 ₪', label: 'עלות — חינם לחלוטין' },
        ].map(s2 => (
          <div key={s2.label} style={s.statItem}>
            <span style={s.statNum}>{s2.num}</span>
            <span style={s.statLabel}>{s2.label}</span>
          </div>
        ))}
      </section>

      {/* CTA bottom */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>מוכן להתחיל?</h2>
        <p style={s.ctaSub}>הרשמה לוקחת פחות מדקה. אין צורך בכרטיס אשראי.</p>
        <button style={s.heroCta} onClick={() => navigate('/login?mode=register')}>
          צור חשבון חינם
        </button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <span style={{ fontWeight: 700, color: C.ink }}>כספי</span>
        <span style={{ color: C.muted, fontSize: '0.8rem' }}>family-finance.net</span>
        <button style={{ ...s.navBtn, fontSize: '0.8rem' }} onClick={() => navigate('/login')}>כניסה</button>
      </footer>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', color: C.ink },

  nav: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
  navLogo: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: C.ink },
  navBtn: { padding: '0.4rem 0.9rem', border: `1px solid ${C.line}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', color: C.ink, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.9rem' },
  navCta: { padding: '0.4rem 0.9rem', border: 'none', borderRadius: 8, background: C.brass, color: '#fff', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.9rem' },

  hero: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '4rem 1.5rem 3rem', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' },
  heroContent: { flex: '1 1 300px', maxWidth: 480, textAlign: 'center' },
  heroEyebrow: { margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 700, color: C.brass, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.ink, margin: '0 0 1rem', lineHeight: 1.2 },
  heroSub: { color: C.muted, fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 2rem' },
  heroCta: { padding: '0.85rem 1.75rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(201,162,63,0.35)' },
  heroGoogle: { display: 'flex', alignItems: 'center', gap: 8, padding: '0.85rem 1.25rem', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, color: C.ink, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', cursor: 'pointer' },

  phone: { flex: '0 0 200px', filter: 'drop-shadow(0 20px 40px rgba(27,42,39,0.18))' },
  phoneScreen: { width: 200, background: C.paper, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}` },

  featuresSection: { background: C.card, padding: '4rem 1.5rem', textAlign: 'center' },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: C.ink, margin: '0 0 2.5rem' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: 900, margin: '0 auto' },
  featureCard: { background: C.paper, borderRadius: 16, padding: '1.5rem 1.25rem', textAlign: 'right' },
  featureIcon: { fontSize: '1.6rem', display: 'block', marginBottom: 10 },
  featureTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1rem', color: C.ink, margin: '0 0 6px' },
  featureBody: { color: C.muted, fontSize: '0.88rem', lineHeight: 1.6, margin: 0 },

  statsStrip: { background: C.ink, color: '#fff', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', padding: '2rem 1.5rem', gap: '1.5rem' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statNum: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.8rem' },
  statLabel: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  ctaSection: { padding: '4rem 1.5rem', textAlign: 'center' },
  ctaTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: C.ink, margin: '0 0 0.75rem' },
  ctaSub: { color: C.muted, margin: '0 0 2rem', fontSize: '1rem' },

  footer: { background: C.card, borderTop: `1px solid ${C.line}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
}
