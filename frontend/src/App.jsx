import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import TakzivLogo from './components/TakzivLogo'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetPage from './pages/BudgetPage'
import RecurringPage from './pages/RecurringPage'
import LoansPage from './pages/LoansPage'
import SavingsPage from './pages/SavingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import ImportPage from './pages/ImportPage'
import HouseholdPage from './pages/HouseholdPage'
import JoinPage from './pages/JoinPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

const queryClient = new QueryClient()

const C = { ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', card: '#F7F8F4', brass: '#C9A23F' }

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#E9EBE4' }} />
  return user ? children : <Navigate to="/welcome" replace />
}

function RequireGuest({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#E9EBE4' }} />
  return user ? <Navigate to="/" replace /> : children
}

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabs = [
    { path: '/', label: 'בית', icon: '⌂' },
    { path: '/transactions', label: 'תנועות', icon: '↕' },
    { path: '/analytics', label: 'ניתוח', icon: '◑' },
    { path: '/savings', label: 'חיסכון', icon: '🎯' },
    { path: '/more', label: 'עוד', icon: '⋯' },
  ]
  return (
    <nav style={styles.nav}>
      {tabs.map(t => (
        <button key={t.path}
          style={{ ...styles.navBtn, ...(pathname === t.path ? styles.navActive : {}) }}
          onClick={() => navigate(t.path)}>
          <span style={{ fontSize: '1rem' }}>{t.icon}</span>
          <span style={{ fontSize: '0.6rem' }}>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

function MorePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const items = [
    { icon: '◎', label: 'תקציב', path: '/budget' },
    { icon: '↺', label: 'תשלומים חוזרים', path: '/recurring' },
    { icon: '🏦', label: 'הלוואות ומשכנתא', path: '/loans' },
    { icon: '⚙', label: 'הגדרות', path: '/settings' },
    { icon: '⬆', label: 'ייבוא CSV', path: '/import' },
    { icon: '👨‍👩‍👧', label: 'משק הבית', path: '/household' },
    { icon: '◉', label: 'פרופיל', path: '/profile' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem' }}>
        <h1 style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0 }}>עוד</h1>
      </header>
      <main style={{ padding: '0.75rem 1rem', maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', background: C.card, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, fontWeight: 600, textAlign: 'right' }}>
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ color: C.muted }}>›</span>
          </button>
        ))}
        <button onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', background: C.card, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: '#B0573C', fontWeight: 600, marginTop: 8 }}>
          <span style={{ fontSize: '1.3rem' }}>⎋</span>
          <span>יציאה מהחשבון</span>
        </button>
        <footer style={{ marginTop: 24, paddingBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TakzivLogo size={20} />
            <span style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.ink }}>תקציב</span>
          </div>
          <span style={{ color: C.muted, fontSize: '0.75rem' }}>פיתוח: אוהד דוד · כל הזכויות שמורות © {new Date().getFullYear()}</span>
          <a href="mailto:ohad2606@gmail.com" style={{ color: C.muted, fontSize: '0.75rem', textDecoration: 'none' }}>תמיכה: ohad2606@gmail.com</a>
          <span style={{ color: C.muted, fontSize: '0.65rem', opacity: 0.6 }}>v 0.1 · {__BUILD_DATE__}</span>
        </footer>
      </main>
    </div>
  )
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

function InstallBanner() {
  const [prompt, setPrompt] = useState(null)   // Android/Chrome deferred event
  const [showIos, setShowIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode() || localStorage.getItem('installDismissed')) return

    if (isIos()) {
      setShowIos(true)
      setVisible(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('installDismissed', '1')
  }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setPrompt(null)
  }

  if (!visible) return null

  return (
    <div style={styles.installBanner}>
      <span style={{ fontSize: '1.3rem' }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={styles.installTitle}>הוסף למסך הבית</p>
        {showIos
          ? <p style={styles.installSub}>לחץ על <strong>שתף</strong> ← <strong>הוסף למסך הבית</strong></p>
          : <p style={styles.installSub}>גישה מהירה לתקציב ללא דפדפן</p>
        }
      </div>
      {!showIos && (
        <button style={styles.installBtn} onClick={install}>התקן</button>
      )}
      <button style={styles.installClose} onClick={dismiss}>✕</button>
    </div>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  return (
    <>
      <Routes>
        <Route path="/welcome" element={<RequireGuest><LandingPage /></RequireGuest>} />
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><TransactionsPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/savings" element={<RequireAuth><SavingsPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/budget" element={<RequireAuth><BudgetPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/recurring" element={<RequireAuth><RecurringPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/loans" element={<RequireAuth><LoansPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/more" element={<RequireAuth><MorePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/import" element={<RequireAuth><ImportPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/household" element={<RequireAuth><HouseholdPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/forgot-password" element={<RequireGuest><ForgotPasswordPage /></RequireGuest>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage onBack={() => navigate('/more')} /></RequireAuth>} />
      </Routes>
      {user && pathname !== '/login' && <BottomNav />}
      <InstallBanner />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = {
  nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.line}`, display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' },
  navBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, padding: '0.55rem 0', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontFamily: 'Assistant, sans-serif' },
  navActive: { color: C.brass },
  installBanner: { position: 'fixed', bottom: 'calc(60px + env(safe-area-inset-bottom))', left: 12, right: 12, background: C.ink, color: '#fff', borderRadius: 16, padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: 10, zIndex: 60, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', fontFamily: 'Assistant, sans-serif', direction: 'rtl' },
  installTitle: { margin: 0, fontWeight: 700, fontSize: '0.9rem' },
  installSub: { margin: '2px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' },
  installBtn: { background: C.brass, color: '#fff', border: 'none', borderRadius: 10, padding: '0.45rem 0.9rem', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 },
  installClose: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', padding: 4, flexShrink: 0 },
}
