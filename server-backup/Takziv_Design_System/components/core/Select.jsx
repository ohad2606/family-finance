import React from 'react'

/**
 * Takziv dropdown — same field styling as Input. Children are <option>s.
 */
export function Select({ children, style = {}, ...rest }) {
  return (
    <select
      style={{
        padding: '0.7rem 1rem',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-input)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--ink)',
        textAlign: 'right',
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  )
}
