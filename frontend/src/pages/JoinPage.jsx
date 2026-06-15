import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getInviteInfo, joinHousehold } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

export default function JoinPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = params.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [householdName, setHouseholdName] = useState('')

  const { data: info, isLoading, isError } = useQuery({
    queryKey: ['invite', token],
    queryFn: () => getInviteInfo(token),
    enabled: !!token,
    retry: false,
  })

  const join = useMutation({
    mutationFn: () => joinHousehold(token),
    onSuccess: (data) => {
      setHouseholdName(data.household_name)
      setDone(true)
    },
  })

  if (!token) {
    return <CenterCard><p style={{ color: C.muted }}>קישור הזמנה לא תקין</p></CenterCard>
  }

  if (isLoading) return <CenterCard><p style={{ color: C.muted }}>טוען...</p></CenterCard>

  if (isError || !info?.valid) {
    return (
      <CenterCard>
        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
        <h2 style={s.cardTitle}>קישור לא תקין</h2>
        <p style={s.cardSub}>הקישור פג תוקף או כבר שומש. בקש קישור חדש.</p>
        <button style={s.primaryBtn} onClick={() => navigate('/login')}>חזור לכניסה</button>
      </CenterCard>
    )
  }

  if (done) {
    return (
      <CenterCard>
        <span style={{ fontSize: '2.5rem' }}>✅</span>
        <h2 style={s.cardTitle}>הצטרפת בהצלחה!</h2>
        <p style={s.cardSub}>עכשיו אתה חבר במשק הבית של <strong>{householdName}</strong></p>
        <button style={s.primaryBtn} onClick={() => navigate('/')}>לדשבורד</button>
      </CenterCard>
    )
  }

  return (
    <CenterCard>
      <span style={{ fontSize: '2.5rem' }}>🏠</span>
      <h2 style={s.cardTitle}>הזמנה למשק הבית</h2>
      <p style={s.cardSub}>
        הוזמנת להצטרף למשק הבית <strong>{info.household_name}</strong>
      </p>

      {user ? (
        <>
          <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: 16 }}>
            מחובר בתור <strong>{user.display_name}</strong>
          </p>
          <button style={s.primaryBtn} onClick={() => join.mutate()} disabled={join.isPending}>
            {join.isPending ? 'מצטרף...' : 'הצטרף למשק הבית'}
          </button>
          {join.isError && (
            <p style={{ color: C.expense, fontSize: '0.85rem', marginTop: 10, textAlign: 'center' }}>
              {join.error?.response?.data?.detail ?? 'שגיאה, נסה שוב'}
            </p>
          )}
        </>
      ) : (
        <>
          <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: 16 }}>
            כדי להצטרף יש להיכנס לחשבון תחילה
          </p>
          <button style={s.primaryBtn}
            onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>
            כניסה / הרשמה
          </button>
        </>
      )}
    </CenterCard>
  )
}

function CenterCard({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Assistant, sans-serif', direction: 'rtl', padding: '1.5rem' }}>
      <div style={{ background: C.card, borderRadius: 24, padding: '2rem 1.5rem', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        {children}
      </div>
    </div>
  )
}

const s = {
  cardTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: C.ink, margin: '12px 0 8px' },
  cardSub: { color: C.muted, fontSize: '0.9rem', margin: '0 0 20px', lineHeight: 1.5 },
  primaryBtn: { width: '100%', padding: '0.8rem', background: C.ink, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem' },
}
