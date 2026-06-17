import React from 'react'

const ILS = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })

/**
 * A monetary figure, the Takziv way: Heebo, tabular-nums, ₪ via he-IL,
 * income/expense color, and an optional leading + / − sign.
 */
export function MoneyAmount({
  value = 0,
  kind = 'neutral',     // 'income' | 'expense' | 'neutral' | 'auto'
  showSign = false,
  onDark = false,
  size = '1rem',
  weight = 'var(--fw-bold)',
  style = {},
  ...rest
}) {
  const resolved = kind === 'auto' ? (value >= 0 ? 'income' : 'expense') : kind
  const colors = onDark
    ? { income: 'var(--on-dark-pos)', expense: 'var(--on-dark-neg)', neutral: 'var(--white)' }
    : { income: 'var(--income)', expense: 'var(--expense)', neutral: 'var(--text-strong)' }

  const sign = showSign ? (resolved === 'income' ? '+' : resolved === 'expense' ? '−' : '') : ''
  const formatted = ILS.format(Math.abs(value))

  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: weight,
        fontSize: size,
        fontVariantNumeric: 'tabular-nums',
        color: colors[resolved],
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {sign}{formatted}
    </span>
  )
}
