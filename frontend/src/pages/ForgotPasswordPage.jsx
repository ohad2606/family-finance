import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C' }

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('שגיאה בשליחה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button style={s.back} onClick={() => navigate('/login')}>← חזרה</button>
        <h1 style={s.title}>שחזור סיסמה</h1>

        {sent ? (
          <div style={s.successBox}>
            <p style={s.successText}>שלחנו קישור לאיפוס הסיסמה לכתובת <strong>{email}</strong></p>
            <p style={s.hint}>אם לא קיבלת — בדוק בתיקיית ספאם. הקישור תקף לשעה.</p>
            <button style={s.btn} onClick={() => navigate('/login')}>חזרה לכניסה</button>
          </div>
        ) : (
          <>
            <p style={s.sub}>הכנס את כתובת המייל שלך ונשלח לך קישור לאיפוס הסיסמה.</p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                style={s.input}
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <p style={s.error}>{error}</p>}
              <button style={s.btn} type="submit" disabled={loading}>
                {loading ? '...' : 'שלח קישור לאיפוס'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Assistant, sans-serif', direction: 'rtl' },
  card: { background: C.card, borderRadius: 22, padding: '2.5rem 2rem', width: '100%', maxWidth: 380, boxShadow: '0 2px 16px rgba(27,42,39,0.08)' },
  back: { background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem', padding: '0 0 0.5rem', display: 'block' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: C.ink, margin: '0 0 0.5rem' },
  sub: { color: C.muted, fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.5 },
  input: { padding: '0.75rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, outline: 'none', textAlign: 'right' },
  btn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  error: { color: C.expense, fontSize: '0.9rem', margin: 0, textAlign: 'center' },
  successBox: { display: 'flex', flexDirection: 'column', gap: 12 },
  successText: { color: C.ink, margin: 0, fontSize: '0.95rem', lineHeight: 1.5 },
  hint: { color: C.muted, fontSize: '0.85rem', margin: 0 },
}
