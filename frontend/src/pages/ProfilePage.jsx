import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { updateMe, changePassword } from '../api/auth'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

function initials(name) {
  return (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ProfilePage({ onBack }) {
  const { user, signOut } = useAuth()
  const qc = useQueryClient()

  const [nameVal, setNameVal] = useState(user?.display_name ?? '')
  const [nameSaved, setNameSaved] = useState(false)

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const isGoogleUser = !user?.email?.includes('@') ? false : true // approximation; backend blocks change-password for google users

  const saveName = useMutation({
    mutationFn: () => updateMe({ display_name: nameVal.trim() }),
    onSuccess: (data) => {
      qc.setQueryData(['me'], data)
      qc.invalidateQueries({ queryKey: ['me'] })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    },
  })

  const savePw = useMutation({
    mutationFn: () => changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
    onSuccess: () => {
      setPwForm({ current_password: '', new_password: '', confirm: '' })
      setPwError('')
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 3000)
    },
    onError: (err) => setPwError(err.response?.data?.detail ?? 'שגיאה, נסה שוב'),
  })

  function submitPw(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.new_password !== pwForm.confirm) { setPwError('הסיסמאות אינן תואמות'); return }
    if (pwForm.new_password.length < 8) { setPwError('הסיסמה חייבת להכיל לפחות 8 תווים'); return }
    savePw.mutate()
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>→</button>
        <h1 style={s.title}>פרופיל</h1>
      </header>

      <main style={s.main}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem' }}>
          <div style={s.avatar}>{initials(user?.display_name)}</div>
          <p style={{ color: C.muted, fontSize: '0.82rem', margin: '6px 0 0' }}>{user?.email}</p>
          <p style={{ color: C.muted, fontSize: '0.75rem', margin: '2px 0 0' }}>
            {user?.household_name} · {user?.role === 'owner' ? 'בעלים' : 'חבר'}
          </p>
        </div>

        {/* Display name */}
        <div style={s.sectionLabel}>שם תצוגה</div>
        <div style={s.card}>
          <label style={s.label}>שם</label>
          <input
            style={s.input}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            placeholder="שמך"
          />
          <button
            style={{ ...s.primaryBtn, opacity: !nameVal.trim() || nameVal === user?.display_name ? 0.5 : 1 }}
            disabled={!nameVal.trim() || nameVal === user?.display_name || saveName.isPending}
            onClick={() => saveName.mutate()}>
            {nameSaved ? '✓ נשמר!' : saveName.isPending ? 'שומר...' : 'שמור שם'}
          </button>
          {saveName.isError && (
            <p style={s.errText}>{saveName.error?.response?.data?.detail ?? 'שגיאה'}</p>
          )}
        </div>

        {/* Change password — only for email/password accounts */}
        <div style={s.sectionLabel}>שינוי סיסמה</div>
        <div style={s.card}>
          {pwSaved && (
            <div style={s.successBox}>✓ הסיסמה שונתה בהצלחה</div>
          )}
          <form onSubmit={submitPw} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <label style={s.label}>סיסמה נוכחית</label>
            <input style={s.input} type="password" value={pwForm.current_password}
              onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
              placeholder="••••••••" autoComplete="current-password" />

            <label style={s.label}>סיסמה חדשה</label>
            <input style={s.input} type="password" value={pwForm.new_password}
              onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
              placeholder="לפחות 8 תווים" autoComplete="new-password" />

            <label style={s.label}>אימות סיסמה חדשה</label>
            <input style={s.input} type="password" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="••••••••" autoComplete="new-password" />

            {pwError && <p style={s.errText}>{pwError}</p>}

            <button type="submit" style={s.primaryBtn} disabled={savePw.isPending}>
              {savePw.isPending ? 'שומר...' : 'שנה סיסמה'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div style={s.sectionLabel}>חשבון</div>
        <div style={s.card}>
          <button onClick={signOut}
            style={{ width: '100%', padding: '0.75rem', background: 'none', border: `1px solid ${C.expense}`, borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: C.expense }}>
            ⎋ יציאה מהחשבון
          </button>
        </div>
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 100 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: '0 4px' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0, flex: 1 },
  main: { padding: '0 1rem', maxWidth: 480, margin: '0 auto' },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: C.brass, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Heebo', fontWeight: 900, fontSize: '1.6rem' },
  sectionLabel: { fontSize: '0.7rem', fontWeight: 700, color: C.muted, letterSpacing: 0.8, padding: '0.6rem 4px 0.2rem', marginTop: 8 },
  card: { background: C.card, borderRadius: 18, padding: '1rem', marginBottom: 8 },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: C.muted, marginBottom: 5 },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, background: '#fff', marginBottom: 12, boxSizing: 'border-box', direction: 'rtl', outline: 'none' },
  primaryBtn: { width: '100%', padding: '0.75rem', background: C.ink, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.95rem' },
  errText: { color: C.expense, fontSize: '0.82rem', margin: '6px 0 10px', textAlign: 'center' },
  successBox: { background: '#D1FAE5', color: C.income, borderRadius: 10, padding: '0.6rem 0.9rem', marginBottom: 14, fontSize: '0.88rem', fontWeight: 600 },
}
