import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { login, register } from '../api/auth'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const OAUTH_ERRORS = {
  oauth_cancelled: 'ההתחברות דרך גוגל בוטלה',
  invalid_state: 'שגיאת אבטחה – נסה שוב',
  token_exchange: 'לא ניתן לאמת את פרטי גוגל',
  userinfo: 'לא ניתן לקבל פרטי משתמש מגוגל',
  missing_info: 'חסרים פרטים מגוגל',
  no_household: 'שגיאה פנימית – אנא פנה לתמיכה',
}

export default function LoginPage() {
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
  const [form, setForm] = useState({ email: '', password: '', display_name: '', household_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setError(OAUTH_ERRORS[err] || 'שגיאה בהתחברות דרך גוגל')
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register(form)
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      const next = searchParams.get('next')
      navigate(next && next.startsWith('/') ? next : '/')
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backLink} onClick={() => navigate('/welcome')}>← כספי</button>
        <h1 style={styles.logo}>כספי</h1>
        <p style={styles.tagline}>ניהול פיננסי משפחתי</p>

        {/* Google button */}
        <a href="/api/auth/google" style={styles.googleBtn}>
          <GoogleIcon />
          <span>המשך עם Google</span>
        </a>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>או</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }} onClick={() => setMode('login')}>כניסה</button>
          <button style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }} onClick={() => setMode('register')}>הרשמה</button>
        </div>

        <form onSubmit={submit} style={styles.form}>
          {mode === 'register' && (
            <>
              <input style={styles.input} placeholder="שם תצוגה" value={form.display_name} onChange={set('display_name')} required />
              <input style={styles.input} placeholder="שם משק הבית (למשל: משפחת ישראלי)" value={form.household_name} onChange={set('household_name')} required />
            </>
          )}
          <input style={styles.input} type="email" placeholder="אימייל" value={form.email} onChange={set('email')} required />
          <input style={styles.input} type="password" placeholder="סיסמה" value={form.password} onChange={set('password')} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'כניסה' : 'הרשמה'}
          </button>
        </form>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Assistant, sans-serif', direction: 'rtl' },
  card: { background: C.card, borderRadius: 22, padding: '2.5rem 2rem', width: '100%', maxWidth: 380, boxShadow: '0 2px 16px rgba(27,42,39,0.08)' },
  logo: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '2rem', color: C.ink, margin: 0, textAlign: 'center' },
  tagline: { color: C.muted, textAlign: 'center', marginTop: 4, marginBottom: '1.5rem' },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '0.75rem', borderRadius: 12, border: `1px solid ${C.line}`,
    background: '#fff', color: C.ink, fontFamily: 'Assistant, sans-serif',
    fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'none',
    marginBottom: '1rem',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' },
  dividerLine: { flex: 1, height: 1, background: C.line },
  dividerText: { color: C.muted, fontSize: '0.8rem', flexShrink: 0 },
  tabs: { display: 'flex', gap: 8, marginBottom: '1.5rem' },
  tab: { flex: 1, padding: '0.5rem', border: `1px solid ${C.line}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', color: C.muted, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem' },
  tabActive: { background: C.ink, color: '#fff', borderColor: C.ink },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '0.75rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, outline: 'none', textAlign: 'right' },
  btn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  error: { color: C.expense, fontSize: '0.9rem', margin: 0, textAlign: 'center' },
  backLink: { background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem', padding: '0 0 0.5rem', display: 'block' },
}
