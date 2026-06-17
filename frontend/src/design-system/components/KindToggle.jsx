import React from 'react'

/**
 * Transaction-kind switch. Two pills; the active one fills with income (forest)
 * or expense (terracotta).
 */
export function KindToggle({ value = 'expense', onChange, style = {} }) {
  const opts = [
    { value: 'expense', label: 'הוצאה', color: 'var(--expense)' },
    { value: 'income', label: 'הכנסה', color: 'var(--income)' },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, ...style }}>
      {opts.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange && onChange(o.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: `1px solid ${active ? o.color : 'var(--line)'}`,
              borderRadius: 'var(--radius-md)',
              background: active ? o.color : 'transparent',
              color: active ? 'var(--white)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--fw-semibold)',
              fontSize: 'var(--fs-sm)',
              transition: 'all var(--dur-fast) var(--ease)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
