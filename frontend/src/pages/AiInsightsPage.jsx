import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAiInsights } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

export default function AiInsightsPage({ onBack }) {
  const navigate = useNavigate()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await getAiInsights()
      setInsights(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בניתוח — נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button style={styles.back} onClick={onBack || (() => navigate('/more'))}>→</button>
        <h1 style={styles.title}>תובנות AI</h1>
        <div style={{ width: 32 }} />
      </header>

      <main style={styles.main}>
        {!insights && !loading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◎</div>
            <p style={styles.emptyTitle}>ניתוח פיננסי חכם</p>
            <p style={styles.emptyDesc}>
              ניתוח 3 החודשים האחרונים: תשלומים חוזרים, חריגות, ועצות מעשיות.
              הניתוח מתבצע על השרת שלך בלבד — שום מידע לא יוצא החוצה.
            </p>
            <button style={styles.analyzeBtn} onClick={analyze}>
              נתח עכשיו
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>מנתח את הנתונים...</p>
            <p style={styles.loadingSubtext}>עשוי לקחת כ-15 שניות</p>
          </div>
        )}

        {insights && (
          <>
            <Section icon="◈" title="סיכום">
              <p style={styles.summaryText}>{insights.summary}</p>
            </Section>

            {insights.recurring?.length > 0 && (
              <Section icon="↺" title="תשלומים חוזרים">
                {insights.recurring.map((r, i) => (
                  <div key={i} style={styles.row}>
                    <span style={styles.rowLabel}>{r.name}</span>
                    <div style={styles.rowRight}>
                      <span style={styles.rowSub}>{r.frequency}</span>
                      <span style={styles.rowAmount}>₪{Number(r.amount).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {insights.anomalies?.length > 0 && (
              <Section icon="⚠" title="חריגות בולטות">
                {insights.anomalies.map((a, i) => (
                  <div key={i} style={styles.anomalyRow}>
                    <span style={styles.anomalyDot} />
                    <span style={styles.anomalyText}>{a.description}</span>
                  </div>
                ))}
              </Section>
            )}

            {insights.advice?.length > 0 && (
              <Section icon="✦" title="עצות">
                {insights.advice.map((tip, i) => (
                  <div key={i} style={styles.adviceRow}>
                    <span style={styles.adviceNum}>{i + 1}</span>
                    <span style={styles.adviceText}>{tip}</span>
                  </div>
                ))}
              </Section>
            )}

            <button style={styles.refreshBtn} onClick={analyze} disabled={loading}>
              ↻ ניתוח חדש
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </>
        )}
      </main>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  )
}

const styles = {
  page: { minHeight: '100vh', background: C.paper, fontFamily: 'Assistant, sans-serif', direction: 'rtl', paddingBottom: 80 },
  header: { background: C.card, borderBottom: `1px solid ${C.line}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  back: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: C.muted, padding: 4, width: 32 },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: C.ink, margin: 0 },
  main: { padding: '1rem', maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: '3rem', textAlign: 'center' },
  emptyIcon: { fontSize: '3rem', color: C.brass },
  emptyTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: C.ink, margin: 0 },
  emptyDesc: { color: C.muted, fontSize: '0.9rem', margin: 0, maxWidth: 280, lineHeight: 1.6 },
  analyzeBtn: { background: C.brass, color: '#fff', border: 'none', borderRadius: 14, padding: '0.85rem 2.5rem', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 8 },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: '4rem' },
  spinner: { width: 40, height: 40, border: `3px solid ${C.line}`, borderTop: `3px solid ${C.brass}`, borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { fontWeight: 700, color: C.ink, margin: 0 },
  loadingSubtext: { color: C.muted, fontSize: '0.85rem', margin: 0 },
  section: { background: C.card, borderRadius: 16, overflow: 'hidden' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, padding: '0.85rem 1rem', borderBottom: `1px solid ${C.line}` },
  sectionIcon: { fontSize: '1rem', color: C.brass },
  sectionTitle: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: C.ink, margin: 0 },
  sectionBody: { padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryText: { color: C.ink, fontSize: '0.92rem', lineHeight: 1.7, margin: 0 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.line}` },
  rowLabel: { color: C.ink, fontSize: '0.88rem', fontWeight: 600 },
  rowRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  rowSub: { color: C.muted, fontSize: '0.72rem' },
  rowAmount: { color: C.ink, fontSize: '0.9rem', fontWeight: 700 },
  anomalyRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  anomalyDot: { width: 7, height: 7, borderRadius: '50%', background: C.expense, flexShrink: 0, marginTop: 6 },
  anomalyText: { color: C.ink, fontSize: '0.88rem', lineHeight: 1.5 },
  adviceRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  adviceNum: { background: C.brass, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 },
  adviceText: { color: C.ink, fontSize: '0.88rem', lineHeight: 1.5 },
  error: { color: C.expense, fontSize: '0.88rem', textAlign: 'center', margin: '4px 0' },
  refreshBtn: { background: 'none', border: `1px solid ${C.line}`, borderRadius: 12, padding: '0.7rem', color: C.muted, fontFamily: 'Assistant, sans-serif', fontSize: '0.9rem', cursor: 'pointer', width: '100%' },
}
