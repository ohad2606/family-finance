import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetPage from './pages/BudgetPage'
import RecurringPage from './pages/RecurringPage'
import LoansPage from './pages/LoansPage'
import SavingsPage from './pages/SavingsPage'

const queryClient = new QueryClient()

const C = { ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', card: '#F7F8F4', brass: '#C9A23F' }

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div style={{ minHeight: '100vh', background: '#E9EBE4' }} />
  return user ? children : <Navigate to="/login" replace />
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
    { path: '/budget', label: 'תקציב', icon: '◎' },
    { path: '/savings', label: 'חיסכון', icon: '🎯' },
    { path: '/more', label: 'עוד', icon: '⋯' },
  ]
  return (
    <nav style={styles.nav}>
      {tabs.map(t => (
        <button key={t.path} style={{ ...styles.navBtn, ...(pathname === t.path ? styles.navActive : {}) }} onClick={() => navigate(t.path)}>
          <span style={{ fontSize: '1rem' }}>{t.icon}</span>
          <span style={{ fontSize: '0.6rem' }}>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

function MorePage({ onBack }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const C2 = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C' }
  const items = [
    { icon: '↺', label: 'תשלומים חוזרים', path: '/recurring' },
    { icon: '🏦', label: 'הלוואות ומשכנתא', path: '/loans' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: C2.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 }}>
      <header style={{ background: C2.card, borderBottom: `1px solid ${C2.line}`, padding: '1rem 1.25rem' }}>
        <h1 style={{ fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C2.ink, margin: 0 }}>עוד</h1>
      </header>
      <main style={{ padding: '0.75rem 1rem', maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', background: C2.card, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C2.ink, fontWeight: 600, textAlign: 'right' }}>
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ color: C2.muted }}>›</span>
          </button>
        ))}
        <button onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', background: C2.card, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C2.expense, fontWeight: 600, marginTop: 8 }}>
          <span style={{ fontSize: '1.3rem' }}>⎋</span>
          <span>יציאה מהחשבון</span>
        </button>
      </main>
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
        <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><TransactionsPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/budget" element={<RequireAuth><BudgetPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/savings" element={<RequireAuth><SavingsPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/recurring" element={<RequireAuth><RecurringPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/loans" element={<RequireAuth><LoansPage onBack={() => navigate('/more')} /></RequireAuth>} />
        <Route path="/more" element={<RequireAuth><MorePage /></RequireAuth>} />
      </Routes>
      {user && pathname !== '/login' && <BottomNav />}
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
}
