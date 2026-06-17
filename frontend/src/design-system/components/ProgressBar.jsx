import React from 'react'

/**
 * Savings-goal / budget progress bar. Track in --line, fill in brass (or a
 * passed color), animated width.
 */
export function ProgressBar({ pct = 0, color = 'var(--brass)', height = 8, style = {} }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div
      style={{
        background: 'var(--line)',
        borderRadius: 'var(--radius-sm)',
        height,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          background: color,
          borderRadius: 'var(--radius-sm)',
          height: '100%',
          width: `${clamped}%`,
          transition: 'width var(--dur-bar) var(--ease)',
        }}
      />
    </div>
  )
}
