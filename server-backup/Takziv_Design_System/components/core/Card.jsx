import React from 'react'

const RADII = { lg: 'var(--radius-lg)', xl: 'var(--radius-xl)', '2xl': 'var(--radius-2xl)' }

/**
 * The Takziv surface. Light card by default; `tone="dark"` inverts to forest
 * ink with white text (net-worth / health cards). Optional colored top accent.
 */
export function Card({
  children,
  tone = 'light',
  radius = 'xl',
  accent,
  shadow = false,
  style = {},
  ...rest
}) {
  const tones = {
    light: { background: 'var(--surface-card)', color: 'var(--text-body)' },
    paper: { background: 'var(--paper)', color: 'var(--text-body)' },
    dark: { background: 'var(--surface-dark)', color: 'var(--text-on-dark)' },
  }
  return (
    <div
      style={{
        borderRadius: RADII[radius] || radius,
        padding: '1.25rem',
        boxSizing: 'border-box',
        boxShadow: shadow ? 'var(--shadow-card)' : 'none',
        ...(accent ? { borderTop: `var(--border-accent) solid ${accent}` } : null),
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
