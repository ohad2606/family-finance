import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { startAuthentication } from '@simplewebauthn/browser'
import { passkeyLoginBegin, passkeyLoginComplete } from '../api/webauthn'
import TakzivLogo from './TakzivLogo'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C',
}

export default function LockScreen({ onUnlock }) {
  const { signOut } = useAuth()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supportsPasskey = typeof window !== 'undefined' && !!window.PublicKeyCredential

  const handleUnlock = async () => {
    setError('')
    setLoading(true)
    try {
      const options = await passkeyLoginBegin()
      const credential = await startAuthentication(options)
      await passkeyLoginComplete(credential)
      await qc.invalidateQueries({ queryKey: ['me'] })
      onUnlock()
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('האימות בוטל')
      } else if (err.response?.status === 401 || err.response?.status === 404) {
        setError('לא נמצאה טביעת אצבע — יש להיכנס מחדש')
      } else {
        setError(err.response?.data?.detail || err.message || 'שגיאה בפתיחת האפליקציה')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <TakzivLogo size={44} />
        <h1 style={s.title}>תקציב</h1>
        <div style={s.lockIcon}>🔒</div>
        <p style={s.subtitle}>האפליקציה נעולה</p>
        <p style={s.hint}>30 דקות של חוסר פעילות</p>

        {error && <p style={s.error}>{error}</p>}

        {supportsPasskey && (
          <button style={{ ...s.unlockBtn, opacity: loading ? 0.7 : 1 }} onClick={handleUnlock} disabled={loading}>
            <span style={{ fontSize: '1.4rem' }}>👆</span>
            <span>{loading ? 'מאמת...' : 'פתח עם טביעת אצבע'}</span>
          </button>
        )}

        {!supportsPasskey && (
          <p style={{ color: C.muted, fontSize: '0.85rem', textAlign: 'center', marginTop: 12 }}>
            טביעת אצבע לא נתמכת במכשיר זה
          </p>
        )}

        <button style={s.signOutBtn} onClick={signOut}>
          כניסה מחדש
        </button>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: C.paper,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Assistant, sans-serif', direction: 'rtl',
  },
  card: {
    background: C.card, borderRadius: 24, padding: '2.5rem 2rem',
    width: '100%', maxWidth: 320,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, boxShadow: '0 4px 24px rgba(27,42,39,0.10)',
    margin: '0 1.25rem',
  },
  title: {
    fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.8rem',
    color: C.ink, margin: 0,
  },
  lockIcon: { fontSize: '2.5rem', margin: '6px 0 2px' },
  subtitle: { fontWeight: 700, color: C.ink, margin: 0, fontSize: '1rem' },
  hint: { color: C.muted, margin: 0, fontSize: '0.82rem' },
  error: { color: C.expense, fontSize: '0.84rem', textAlign: 'center', margin: '6px 0 0' },
  unlockBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '0.9rem',
    background: C.ink, color: '#fff', border: 'none', borderRadius: 14,
    fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem',
    cursor: 'pointer', marginTop: 14,
  },
  signOutBtn: {
    background: 'none', border: 'none', color: C.muted,
    fontFamily: 'Assistant, sans-serif', fontSize: '0.85rem',
    cursor: 'pointer', padding: '8px 0', marginTop: 2,
  },
}
