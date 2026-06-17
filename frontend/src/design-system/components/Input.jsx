import React from 'react'

/**
 * Takziv text field. Paper fill, hairline border, 12px radius, right-aligned
 * for Hebrew. Shows a brass focus ring.
 */
export function Input({ style = {}, onFocus, onBlur, ...rest }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      onFocus={(e) => { setFocused(true); onFocus && onFocus(e) }}
      onBlur={(e) => { setFocused(false); onBlur && onBlur(e) }}
      style={{
        padding: '0.75rem 1rem',
        border: `1px solid ${focused ? 'var(--brass)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-input)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body)',
        color: 'var(--ink)',
        outline: 'none',
        textAlign: 'right',
        boxSizing: 'border-box',
        width: '100%',
        transition: 'border-color var(--dur-fast) var(--ease)',
        ...style,
      }}
      {...rest}
    />
  )
}
