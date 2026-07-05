import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAccount } from '../api/finance'
import BottomSheet from './BottomSheet'

const C = { paper: '#E9EBE4', card: '#F7F8F4', ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF', brass: '#C9A23F', expense: '#B0573C', income: '#2F6B4F' }

function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: C.ink }}>{label}</p>
        {sub && <p style={{ margin: '1px 0 0', fontSize: '0.75rem', color: C.muted }}>{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: value ? C.brass : C.line, position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'inset-inline-end 0.2s, inset-inline-start 0.2s',
          insetInlineEnd: value ? 4 : 'auto', insetInlineStart: value ? 'auto' : 4,
        }} />
      </button>
    </div>
  )
}

export default function EditAccountSheet({ account, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: account.name,
    nickname: account.nickname || '',
    institution: account.institution || '',
    credit_limit: account.credit_limit != null ? String(account.credit_limit) : '',
    billing_day: account.billing_day != null ? String(account.billing_day) : '',
    revolving_amount: account.revolving_amount != null ? String(account.revolving_amount) : '',
    show_on_dashboard: account.show_on_dashboard ?? true,
    include_in_totals: account.include_in_totals ?? true,
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (data) => updateAccount(account.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      onClose()
    },
    onError: (e) => setError(e.response?.data?.detail || 'שגיאה בשמירה'),
  })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('שם הוא שדה חובה'); return }
    mutation.mutate({
      name: form.name.trim(),
      nickname: form.nickname.trim() || null,
      institution: form.institution.trim() || null,
      credit_limit: form.credit_limit !== '' ? parseFloat(form.credit_limit) : null,
      billing_day: form.billing_day !== '' ? parseInt(form.billing_day) : null,
      revolving_amount: form.revolving_amount !== '' ? parseFloat(form.revolving_amount) : null,
      show_on_dashboard: form.show_on_dashboard,
      include_in_totals: form.include_in_totals,
    })
  }

  const ACCOUNT_LABELS = { checking: 'עו"ש', savings: 'חיסכון', cash: 'מזומן', credit: 'אשראי', investment: 'השקעות' }

  return (
    <BottomSheet onClose={onClose}>
      <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: C.muted }}>{ACCOUNT_LABELS[account.type] || account.type}</p>
      <h2 style={styles.title}>{account.name}</h2>

      <form onSubmit={submit} style={styles.form}>
        <input style={styles.input} placeholder="שם החשבון" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

        <input style={styles.input} placeholder="כינוי (יוצג במקום השם הרשמי)"
          value={form.nickname}
          onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />

        <input style={styles.input} placeholder="בנק / מוסד (אופציונלי)"
          value={form.institution}
          onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />

        {account.type === 'credit' && (
          <>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: C.muted }}>מסגרת אשראי כוללת</p>
              <input style={styles.input} type="number" inputMode="decimal"
                placeholder="לדוגמה: 5000"
                value={form.credit_limit}
                onChange={e => setForm(f => ({ ...f, credit_limit: e.target.value }))}
                min="0" step="1" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: C.muted }}>יום חיוב חודשי</p>
              <input style={styles.input} type="number" inputMode="numeric"
                placeholder="1–28 (ברירת מחדל: 1)"
                value={form.billing_day}
                onChange={e => setForm(f => ({ ...f, billing_day: e.target.value }))}
                min="1" max="28" step="1" />
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: C.muted }}>
                {form.billing_day
                  ? `השימוש מחושב מה-${form.billing_day} לכל חודש`
                  : account.billing_day
                    ? `מוגדר כעת: ${account.billing_day} — השאר ריק כדי לשמר`
                    : 'ברירת מחדל: 1 לחודש'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: C.muted }}>אשראי מתגלגל — סכום שירד בחיוב הקרוב</p>
              <input style={styles.input} type="number" inputMode="decimal"
                placeholder="ריק = חיוב מלא"
                value={form.revolving_amount}
                onChange={e => setForm(f => ({ ...f, revolving_amount: e.target.value }))}
                min="0" step="1" />
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: C.muted }}>
                {form.revolving_amount
                  ? `יורד ₪${Number(form.revolving_amount).toLocaleString('he-IL')} בחיוב הקרוב`
                  : account.revolving_amount != null
                    ? `מוגדר כעת: ₪${account.revolving_amount.toLocaleString('he-IL')} — השאר ריק לשמר`
                    : 'ברירת מחדל: הסכום המלא'}
              </p>
            </div>
          </>
        )}

        <div style={{ background: C.paper, borderRadius: 14, padding: '0 0.75rem', marginTop: 4 }}>
          <Toggle
            value={form.show_on_dashboard}
            onChange={v => setForm(f => ({ ...f, show_on_dashboard: v }))}
            label="הצג במסך הבית"
            sub="מופיע בסקירת החשבונות בראש הדשבורד"
          />
          <div style={{ height: 1, background: C.line }} />
          <Toggle
            value={form.include_in_totals}
            onChange={v => setForm(f => ({ ...f, include_in_totals: v }))}
            label="כלול בחישובי הכנסות/הוצאות"
            sub="משפיע על שווי נקי, תזרים, ובריאות פיננסית"
          />
        </div>

        {error && <p style={{ color: C.expense, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.btnCancel} type="button" onClick={onClose}>ביטול</button>
          <button style={styles.btn} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(27,42,39,0.4)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: C.card, borderRadius: '22px 22px 0 0', padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: 'Assistant, sans-serif', boxSizing: 'border-box' },
  handle: { width: 40, height: 4, background: C.line, borderRadius: 2, margin: '0 auto 1rem' },
  title: { fontFamily: 'Heebo, sans-serif', fontWeight: 700, color: C.ink, margin: '0 0 1.25rem', fontSize: '1.15rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: '0.7rem 1rem', border: `1px solid ${C.line}`, borderRadius: 12, background: C.paper, fontFamily: 'Assistant, sans-serif', fontSize: '0.95rem', color: C.ink, textAlign: 'right', boxSizing: 'border-box', width: '100%' },
  btn: { flex: 1, padding: '0.8rem', background: C.brass, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
  btnCancel: { flex: '0 0 auto', padding: '0.8rem 1.2rem', background: 'transparent', color: C.muted, border: `1px solid ${C.line}`, borderRadius: 14, fontFamily: 'Assistant, sans-serif', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: 4 },
}
