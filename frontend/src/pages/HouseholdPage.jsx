import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getHousehold, createInvite, removeMember, updateHouseholdName } from '../api/finance'

const C = {
  paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E',
  line: '#D5D8CF', income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const ROLE_LABEL = { owner: 'בעלים', member: 'חבר', viewer: 'צופה' }

function initials(name) {
  return (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function HouseholdPage({ onBack }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [inviteUrl, setInviteUrl] = useState(null)
  const [inviteExpiry, setInviteExpiry] = useState(null)
  const [copied, setCopied] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [pendingRemove, setPendingRemove] = useState(null)

  const { data: hh, isLoading } = useQuery({ queryKey: ['household'], queryFn: getHousehold })

  const invite = useMutation({
    mutationFn: createInvite,
    onSuccess: (data) => {
      setInviteUrl(data.url)
      setInviteExpiry(new Date(data.expires_at))
    },
  })

  const remove = useMutation({
    mutationFn: removeMember,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['household'] }); setPendingRemove(null) },
  })

  const rename = useMutation({
    mutationFn: () => updateHouseholdName(nameInput.trim()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['household'] }); setEditingName(false) },
  })

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function startRename() {
    setNameInput(hh?.name ?? '')
    setEditingName(true)
  }

  if (isLoading) return <div style={s.page} />

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={onBack}>→</button>
        <h1 style={s.title}>משק הבית</h1>
      </header>

      <main style={s.main}>
        {/* Household name */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingName ? (
              <input
                style={{ ...s.input, flex: 1, marginBottom: 0, marginInlineEnd: 10 }}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                autoFocus
              />
            ) : (
              <div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: C.muted, fontWeight: 700 }}>שם משק הבית</p>
                <p style={{ margin: '2px 0 0', fontFamily: 'Heebo', fontWeight: 700, fontSize: '1.15rem', color: C.ink }}>{hh?.name}</p>
              </div>
            )}
            {editingName ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditingName(false)} style={s.cancelBtn}>ביטול</button>
                <button onClick={() => rename.mutate()} disabled={!nameInput.trim()} style={s.smallPrimaryBtn}>
                  {rename.isPending ? '...' : 'שמור'}
                </button>
              </div>
            ) : (
              <button onClick={startRename} style={s.ghostBtn}>✎ עריכה</button>
            )}
          </div>
        </div>

        {/* Members */}
        <div style={s.sectionLabel}>חברי משק הבית</div>
        <div style={s.card}>
          {hh?.members.map(m => (
            <div key={m.id} style={s.memberRow}>
              <div style={{ ...s.avatar, background: m.user_id === user?.id ? C.brass : C.ink }}>
                {initials(m.display_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>
                  {m.display_name}
                  {m.user_id === user?.id && <span style={{ color: C.muted, fontWeight: 400, fontSize: '0.78rem' }}> (אתה)</span>}
                </div>
                <div style={{ color: C.muted, fontSize: '0.78rem' }}>{m.email}</div>
              </div>
              <span style={s.roleBadge}>{ROLE_LABEL[m.role] ?? m.role}</span>
              {m.user_id !== user?.id && (
                pendingRemove === m.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPendingRemove(null)} style={s.cancelBtn}>ביטול</button>
                    <button onClick={() => remove.mutate(m.id)} style={s.removeBtn}>
                      {remove.isPending ? '...' : 'הסר'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setPendingRemove(m.id)} style={{ ...s.ghostBtn, color: C.expense }}>הסר</button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Invite */}
        <div style={s.sectionLabel}>הזמנת חבר</div>
        <div style={s.card}>
          <p style={{ margin: '0 0 12px', color: C.muted, fontSize: '0.85rem' }}>
            צור קישור הזמנה ושלח לבן/בת הזוג. הקישור בתוקף ל-7 ימים.
          </p>

          {inviteUrl ? (
            <>
              <div style={s.urlBox}>
                <span style={{ fontSize: '0.78rem', color: C.ink, wordBreak: 'break-all', flex: 1 }}>{inviteUrl}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button style={{ ...s.primaryBtn, flex: 1 }} onClick={copyLink}>
                  {copied ? '✓ הועתק!' : '📋 העתק קישור'}
                </button>
                <button style={{ ...s.ghostBtn, flexShrink: 0 }} onClick={() => invite.mutate()}>
                  חדש
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: C.muted, textAlign: 'center' }}>
                פג תוקף: {inviteExpiry?.toLocaleDateString('he-IL')}
              </p>
            </>
          ) : (
            <button style={s.primaryBtn} onClick={() => invite.mutate()} disabled={invite.isPending}>
              {invite.isPending ? 'יוצר קישור...' : '+ צור קישור הזמנה'}
            </button>
          )}
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
  main: { padding: '1rem', maxWidth: 560, margin: '0 auto' },
  card: { background: C.card, borderRadius: 18, padding: '1rem', marginBottom: 8 },
  sectionLabel: { fontSize: '0.7rem', fontWeight: 700, color: C.muted, letterSpacing: 0.8, padding: '0.5rem 4px 0.2rem', marginTop: 8 },
  memberRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 0', borderBottom: `1px solid ${C.line}` },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Heebo', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
  roleBadge: { fontSize: '0.72rem', color: C.muted, background: C.paper, borderRadius: 8, padding: '2px 8px', flexShrink: 0 },
  urlBox: { background: C.paper, borderRadius: 10, padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}` },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: 'Assistant, sans-serif', fontSize: '1rem', color: C.ink, background: '#fff', boxSizing: 'border-box', direction: 'rtl', outline: 'none', marginBottom: 14 },
  primaryBtn: { width: '100%', padding: '0.75rem', background: C.ink, color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.95rem' },
  ghostBtn: { background: 'none', border: `1px solid ${C.line}`, borderRadius: 10, padding: '5px 12px', cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontSize: '0.82rem', color: C.muted, flexShrink: 0 },
  smallPrimaryBtn: { padding: '5px 14px', background: C.ink, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '0.85rem' },
  cancelBtn: { padding: '4px 10px', background: C.line, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', color: C.ink, fontFamily: 'Assistant, sans-serif' },
  removeBtn: { padding: '4px 10px', background: C.expense, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', color: '#fff', fontFamily: 'Assistant, sans-serif' },
}
