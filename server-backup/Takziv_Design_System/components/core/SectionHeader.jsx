import React from 'react'

/**
 * Section title + optional trailing ghost action ("הכל" / "+ הוסף"), the
 * pattern atop every dashboard section.
 */
export function SectionHeader({ title, actionLabel, onAction, children, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        ...style,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--fs-h3)',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children
        ? children
        : actionLabel && (
            <button
              onClick={onAction}
              style={{
                padding: '0.3rem 0.75rem',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--brass)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--fw-semibold)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              {actionLabel}
            </button>
          )}
    </div>
  )
}
