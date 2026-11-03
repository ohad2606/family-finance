import React from 'react'

const PAD = { sm: '0.4rem 0.9rem', md: '0.6rem 1.2rem', lg: '0.85rem 1.75rem' }
const FS = { sm: '0.85rem', md: '0.95rem', lg: '1rem' }
const RADIUS = { sm: 8, md: 12, lg: 14 }

/**
 * Takziv primary action button. Brass fill is the one "do this" color;
 * secondary is a hairline outline; ghost is text-only.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  as = 'button',
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: PAD[size],
    fontSize: FS[size],
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-bold)',
    borderRadius: RADIUS[size],
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    lineHeight: 1.2,
    boxSizing: 'border-box',
    transition: 'box-shadow var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease)',
  }

  const variants = {
    primary: {
      background: 'var(--brass)',
      color: 'var(--accent-text)',
      boxShadow: 'var(--shadow-cta)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--ink)',
      borderColor: 'var(--line)',
      fontWeight: 'var(--fw-semibold)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--brass)',
      fontWeight: 'var(--fw-semibold)',
    },
    dark: {
      background: 'var(--ink)',
      color: 'var(--white)',
    },
  }

  const Tag = as
  return (
    <Tag style={{ ...base, ...variants[variant], ...style }} disabled={Tag === 'button' ? disabled : undefined} {...rest}>
      {children}
    </Tag>
  )
}
