import React from 'react'

/**
 * Login-style tabs. Outline pills; the active one flips to ink fill / white text.
 * Pass items as [{ value, label }] and control with `value` + `onChange`.
 */
export function Tabs({ items = [], value, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 8, ...style }}>
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            onClick={() => onChange && onChange(it.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
              borderRadius: 'var(--radius-md)',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--white)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--fs-sm)',
              fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              transition: 'all var(--dur-fast) var(--ease)',
            }}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
