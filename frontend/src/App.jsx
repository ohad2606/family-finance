import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetPage from './pages/BudgetPage'
import RecurringPage from './pages/RecurringPage'
import LoansPage from './pages/LoansPage'

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
    { path: '/recurring', label: 'חוזרים', icon: '↺' },
    { path: '/loans', label: 'הלוואות', icon: '🏦' },
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
        <Route path="/recurring" element={<RequireAuth><RecurringPage onBack={() => navigate('/')} /></RequireAuth>} />
        <Route path="/loans" element={<RequireAuth><LoansPage onBack={() => navigate('/')} /></RequireAuth>} />
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
