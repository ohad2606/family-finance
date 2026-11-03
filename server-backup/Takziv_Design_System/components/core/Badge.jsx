import React from 'react'

const TONES = {
  excellent: { color: 'var(--status-excellent-fg)', background: 'var(--status-excellent-bg)' },
  good:      { color: 'var(--status-good-fg)',      background: 'var(--status-good-bg)' },
  fair:      { color: 'var(--status-fair-fg)',      background: 'var(--status-fair-bg)' },
  poor:      { color: 'var(--status-poor-fg)',      background: 'var(--status-poor-bg)' },
  na:        { color: 'var(--status-na-fg)',        background: 'var(--status-na-bg)' },
  brass:     { color: 'var(--white)',               background: 'var(--brass)' },
  income:    { color: 'var(--white)',               background: 'var(--income)' },
  expense:   { color: 'var(--white)',               background: 'var(--expense)' },
}

/**
 * Small status pill — the soft fg-on-tint chip from the financial-health card,
 * plus solid income/expense/brass variants.
 */
export function Badge({ children, tone = 'na', style = {}, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-bold)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.5,
        ...TONES[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
