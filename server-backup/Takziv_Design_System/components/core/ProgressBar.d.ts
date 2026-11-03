import React from 'react'

/**
 * Savings-goal / budget fill bar — --line track, brass fill, animated width.
 * @startingPoint section="Feedback" subtitle="Goal & budget progress" viewport="700x110"
 */
export interface ProgressBarProps {
  /** Fill percentage 0–100 (clamped). */
  pct: number;
  /** Fill color — brass by default; pass a goal's own color. */
  color?: string;
  /** Bar height in px. */
  height?: number;
  style?: React.CSSProperties;
}

/** Savings-goal / budget fill bar — --line track, brass fill, animated width. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
