import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C', income: '#2F6B4F' }

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('הסיסמאות אינן תואמות'); return }
    if (password.length < 8) { setError('הסיסמה חייבת להכיל לפחות 8 תווים'); return }
    setLoading(true)
    setError('')
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.error}>קישור לא תקין</p>
        <button style={s.btn} onClick={() => navigate('/forgot-password')}>בקש קישור חדש</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>סיסמה חדשה</h1>

        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: C.income, fontWeight: 700, margin: 0 }}>הסיסמה עודכנה בהצלחה!</p>
            <button style={s.btn} onClick={() => navigate('/login')}>כניסה לחשבון</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={s.input}
              type="password"
              placeholder="סיסמה חדשה (לפחות 8 תווים)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              style={s.input}
              type="password"
              placeholder="אימות סיסמה"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? '...' : 'שמור סיסמה'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Assistant, sans-serif', direction: 'rtl' },
  card: { background: C.card, borderRadius: 22, padding: '2.5rem 2rem', width: '100%', maxWidth: 380, boxShadow: '0 2px 16px rgba(27,42,39,0.08)' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: C.ink, margin: '0 0 1.5rem' },
  input: { padding: '0.75rem 1rem', border: `1px solid C.line`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, outline: 'none', textAlign: 'right' },
  btn: { padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  error: { color: C.expense, fontSize: '0.9rem', margin: 0, textAlign: 'center' },
}
