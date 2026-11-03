import React from 'react'

/**
 * Takziv brand lockup — the logomark (forest tile + brass roof over a ₪ ledger)
 * with an optional תקציב wordmark. `onDark` switches the wordmark to white.
 */
export function Logo({ size = 28, wordmark = true, onDark = false, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0 }} aria-label="תקציב">
        <rect width="64" height="64" rx="14" fill="#1B2A27" />
        <polygon points="32,14 50,32 14,32" fill="#C9A23F" />
        <rect x="18" y="31" width="28" height="17" rx="1" fill="#C9A23F" fillOpacity="0.18" stroke="#C9A23F" strokeWidth="2" />
        <text x="32" y="43" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#C9A23F">₪</text>
      </svg>
      {wordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-black)',
            fontSize: size * 0.05 + 'rem',
            color: onDark ? 'var(--white)' : 'var(--ink)',
            lineHeight: 1,
          }}
        >
          תקציב
        </span>
      )}
    </span>
  )
}
